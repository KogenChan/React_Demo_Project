import { useState, useRef, useEffect } from 'react'
import supabase from '../supabase/supabase-client'
import { PiUserCircleFill } from 'react-icons/pi'
import { AiFillEdit } from 'react-icons/ai'

export default function Avatar({ url, onUpload, previewMode = false }) {
   const [avatarUrl, setAvatarUrl] = useState(null)
   const [uploading, setUploading] = useState(false)
   const fileInputRef = useRef(null)

   // Download and set avatar URL
   useEffect(() => {
      
      if (!url) {
         setAvatarUrl(null)
         return
      }
      
      // If it's a blob URL from preview, use it directly
      if (url.startsWith('blob:')) {
         setAvatarUrl(url)
         return
      }

      // If it's already a full HTTP URL (legacy public URLs), use it directly
      if (url.startsWith('http')) {
         setAvatarUrl(url)
         return
      }

      // Otherwise, it's a storage path - create a signed URL
      const getSignedUrl = async (path) => {
         try {
            const { data, error } = await supabase.storage
               .from('avatars')
               .createSignedUrl(path, 3600) // URL valid for 1 hour
            
            if (error) {
               throw error
            }
            setAvatarUrl(data.signedUrl)
         } catch (error) {
            console.log('Error creating signed URL: ', error)
         }
      }

      getSignedUrl(url)
   }, [url])

   // Function to process and resize image to 166x166
   const processImage = (file) => {
      return new Promise((resolve, reject) => {
         const reader = new FileReader()
         reader.onload = (e) => {
            const img = new Image()
            img.onload = () => {
               const canvas = document.createElement('canvas')
               const size = 166
               canvas.width = size
               canvas.height = size
               const ctx = canvas.getContext('2d')

               // Calculate dimensions to fill the square (crop to fit)
               const scale = Math.max(size / img.width, size / img.height)
               const scaledWidth = img.width * scale
               const scaledHeight = img.height * scale
               const x = (size - scaledWidth) / 2
               const y = (size - scaledHeight) / 2

               // Draw image centered and cropped
               ctx.drawImage(img, x, y, scaledWidth, scaledHeight)

               // Convert canvas to blob
               canvas.toBlob((blob) => {
                  resolve(blob)
               }, 'image/jpeg', 0.9)
            }
            img.onerror = reject
            img.src = e.target.result
         }
         reader.onerror = reject
         reader.readAsDataURL(file)
      })
   }

   const uploadAvatar = async (event) => {
      try {
         setUploading(true)

         if (!event.target.files || event.target.files.length === 0) {
            throw new Error('You must select an image to upload.')
         }

         const file = event.target.files[0]

         // Process the image to 166x166
         const processedBlob = await processImage(file)
         const processedFile = new File([processedBlob], file.name, { type: 'image/jpeg' })

         if (previewMode) {
            // Preview mode: just show the image, don't upload
            const previewUrl = URL.createObjectURL(processedBlob)
            setAvatarUrl(previewUrl)
            onUpload(event, processedFile)
         } else {
            // Upload mode: upload to Supabase immediately
            const fileExt = file.name.split('.').pop()
            const fileName = `${Math.random()}.${fileExt}`
            const filePath = `${fileName}`

            const { error: uploadError } = await supabase.storage
               .from('avatars')
               .upload(filePath, processedFile)

            if (uploadError) {
               throw uploadError
            }

            onUpload(event, filePath)
         }
      } catch (error) {
         alert(error.message)
      } finally {
         setUploading(false)
      }
   }

   const handleEditClick = () => {
      fileInputRef.current?.click()
   }

   return (
      <div 
         className="relative inline-block hover:cursor-pointer"
         onClick={handleEditClick}
      >
         {avatarUrl ? (
            <img
               src={avatarUrl}
               alt="Avatar"
               className="avatar image rounded-full object-cover"
               width={"166px"}
               height={"166px"}
            />
         ) : (
            <PiUserCircleFill className='text-[11.5rem] text-accent mx-[-0.5rem] my-[-0.5rem]' />
         )}

         <button
            type="button"
            onClick={(e) => {
               e.stopPropagation()
               handleEditClick()
            }}
            disabled={uploading}
            className="absolute bottom-[-3px] right-[-4px] hover:cursor-pointer disabled:opacity-50"
         >
            <AiFillEdit size={28} className='text-base-content' />
         </button>

         <input
            ref={fileInputRef}
            type="file"
            id="single"
            accept="image/*"
            onChange={uploadAvatar}
            disabled={uploading}
            className="hidden"
         />
      </div>
   );
};