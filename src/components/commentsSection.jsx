import { useEffect, useState, useRef } from "react";
import Button from "./button";
import Comment from "./comment";
import supabase from "../supabase/supabase-client";
import { useSession } from '../context/SessionContext';
import { useGetProfile } from "../utils/useGetProfile";
import { Link, useLocation } from "react-router";
import routes from "../routing/routes.min";
import { HiArrowTurnDownRight, HiArrowTurnLeftUp } from "react-icons/hi2";

export default function Comments({ gameId }) {
   const { session } = useSession();
   const { profile } = useGetProfile(session);
   const location = useLocation();
   const [comments, setComments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [editingId, setEditingId] = useState(null);
   const [replyingTo, setReplyingTo] = useState(null);
   const [replyVisibility, setReplyVisibility] = useState({});
   const inputRef = useRef(null);
   const scrollPosRef = useRef(0);

   const fetchComments = async () => {
      try {
         const { data, error } = await supabase
            .from("messages")
            .select("*")
            .eq("game_id", gameId)
            .order("updated_at", { ascending: false });

         if (error) throw error;
         setComments(data || []);
      } catch (err) {
         console.error("Error fetching comments:", err);
      } finally {
         setLoading(false);
      }
   };

   useEffect(() => {
      if (!gameId) {
         setLoading(false);
         return;
      }

      fetchComments();

      const channel = supabase
         .channel(`messages:game_id=eq.${gameId}`)
         .on(
            "postgres_changes",
            {
               event: "*",
               schema: "public",
               table: "messages",
               filter: `game_id=eq.${gameId}`,
            },
            (payload) => {
               if (payload.eventType === "INSERT") {
                  setComments((prev) => [...prev, payload.new]);
               } else if (payload.eventType === "UPDATE") {
                  setComments((prev) =>
                     prev.map((c) => (c.id === payload.new.id ? payload.new : c))
                  );
               } else if (payload.eventType === "DELETE") {
                  setComments((prev) => prev.filter((c) => c.id !== payload.old.id));
               }
            }
         )
         .subscribe();

      return () => {
         supabase.removeChannel(channel);
      };
   }, [gameId]);

   const handleMessageSubmit = async (event) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      const message = formData.get("message");

      if (typeof message === "string" && message.trim().length !== 0) {
         try {
            const parentCommentId = replyingTo ? replyingTo.id : null;

            const { error } = await supabase
               .from("messages")
               .insert([
                  {
                     profile_id: session?.user.id,
                     profile_username: profile?.username,
                     game_id: gameId,
                     content: message,
                     parent_comment_id: parentCommentId,
                  },
               ]);

            if (error) throw error;

            if (event.currentTarget) {
               event.currentTarget.reset();
            }

            setReplyingTo(null);
         } catch (err) {
            console.error("Error posting comment:", err);
         }
      }
   };

   const handleEdit = async (commentId, newContent) => {
      if (!newContent.trim()) return;

      try {
         const { error } = await supabase
            .from("messages")
            .update({ content: newContent })
            .eq("id", commentId);

         if (error) throw error;

         setComments((prev) =>
            prev.map((comment) =>
               comment.id === commentId ? { ...comment, content: newContent } : comment
            )
         );

         setEditingId(null);
      } catch (err) {
         console.error("Error editing comment:", err);
      }
   };

   const handleRemove = async (commentId) => {
      try {
         const visited = new Set();

         const deleteRecursive = async (id) => {
            if (visited.has(id)) {
               console.warn(`Skipping already visited id: ${id}`);
               return;
            }
            visited.add(id);

            const children = comments.filter((c) => c.parent_comment_id === id);
            for (const child of children) {
               await deleteRecursive(child.id);
            }

            const { error } = await supabase
               .from("messages")
               .delete()
               .eq("id", id);

            if (error) {
               console.error(`Error deleting comment ${id}:`, error);
               throw error;
            }
         };

         await deleteRecursive(commentId);

         setComments((prev) => {
            const toRemove = new Set();
            const collect = (id) => {
               toRemove.add(id);
               prev.forEach((c) => {
                  if (c.parent_comment_id === id) {
                     collect(c.id);
                  }
               });
            };
            collect(commentId);

            return prev.filter((c) => !toRemove.has(c.id));
         });
      } catch (err) {
         console.error("Error removing comment:", err);
         alert("Failed to remove comment. Please try again.");
      }
   };

   const handleReply = (comment) => {
      setReplyingTo(comment);
   };

   const getReplies = (commentId) => {
      return comments.filter((c) => c.parent_comment_id === commentId);
   };

   const getPrimaryComments = () => {
      return comments.filter((c) => !c.parent_comment_id);
   };

   const toggleReplyVisibility = (commentId) => {
      scrollPosRef.current = window.scrollY;

      setReplyVisibility((prev) => ({
         ...prev,
         [commentId]: !prev[commentId],
      }));
   };

   useEffect(() => {
      if (scrollPosRef.current !== 0) {
         window.scrollTo({
            top: scrollPosRef.current,
            behavior: "auto",
         });
         scrollPosRef.current = 0;
      }
   }, [replyVisibility]);

   const CommentWithReplies = ({ comment }) => {
      const replies = getReplies(comment.id);
      const showReplies = replyVisibility[comment.id] ?? false;

      return (
         <div key={comment.id}>
            <Comment
               id={comment.id}
               content={comment.content}
               updatedAt={comment.updated_at}
               profileId={comment.profile_id}
               profileUsername={comment.profile_username}
               isNested={false}
               isOwnComment={session?.user.id === comment.profile_id}
               onEdit={handleEdit}
               onRemove={handleRemove}
               onReply={handleReply}
               editingId={editingId}
               onStartEdit={(id, content) => {
                  setEditingId(id);
               }}
               onCancelEdit={() => {
                  setEditingId(null);
               }}
            />

            {/* Reply input */}
            {replyingTo?.id === comment.id && session && (
               <div className="ml-6 lg:ml-12 mt-[-12px] mb-9 bg-base-200 rounded-3xl border-2 border-[#232d3f]">
                  <div className="px-5 py-4 border-b border-base-300">
                     <span className="text-sm text-gray-400">
                        Replying to <strong>{replyingTo.profile_username}</strong>
                     </span>
                     <button
                        type="button"
                        onClick={() => setReplyingTo(null)}
                        className="cursor-pointer float-right text-sm text-gray-400 hover:text-gray-300"
                     >
                        ✕
                     </button>
                  </div>
                  <form onSubmit={handleMessageSubmit}>
                     <textarea
                        name="message"
                        rows="3"
                        className="rounded-xs p-3 px-5 w-full text-sm bg-base-300 focus:outline-none focus:ring-2 focus:ring-accent transition-all resize-none"
                        placeholder="Write a reply..."
                        autoFocus
                        required
                     />
                     <div className="mt-1 mb-3 mx-3 flex justify-end">
                        <Button content="Post reply" />
                     </div>
                  </form>
               </div>
            )}

            {/* Replies & toggle */}
            {replies.length > 0 && (
               <div className="ml-9 lg:ml-12 mt-[-22px]">
                  {!showReplies ? (
                     <button
                        className="text-sm text-gray-400 hover:underline mt-8 cursor-pointer flex"
                        onClick={() => toggleReplyVisibility(comment.id)}
                     >
                        <HiArrowTurnDownRight />
                        <p className="mt-[-3px] pl-0.5">
                           View {replies.length} {replies.length === 1 ? "reply" : "replies"}
                        </p>
                     </button>
                  ) : (
                     <>
                        <div className="space-y-0 mt-[-12px]">
                           {replies.map((reply) => (
                              <Comment
                                 key={reply.id}
                                 id={reply.id}
                                 content={reply.content}
                                 updatedAt={reply.updated_at}
                                 profileId={reply.profile_id}
                                 profileUsername={reply.profile_username}
                                 isNested={true}
                                 isOwnComment={session?.user.id === reply.profile_id}
                                 onEdit={handleEdit}
                                 onRemove={handleRemove}
                                 onReply={null}
                                 editingId={editingId}
                                 onStartEdit={(id, content) => {
                                    setEditingId(id);
                                 }}
                                 onCancelEdit={() => {
                                    setEditingId(null);
                                 }}
                              />
                           ))}
                        </div>
                        <button
                           className="text-sm text-gray-400 hover:underline mt-3 cursor-pointer flex"
                           onClick={() => toggleReplyVisibility(comment.id)}
                        >
                           <HiArrowTurnLeftUp />
                           <p className="mt-[-3px] pl-0.5">Hide replies</p>
                        </button>
                     </>
                  )}
               </div>
            )}
         </div>
      );
   };

   if (loading) {
      return <div className="text-center py-8">Loading comments...</div>;
   }

   return (
      <section className="bg-base-300 py-8 lg:py-16">
         <div className="max-w-[64rem] mx-auto px-4">
            <div className="flex justify-between items-center mb-6">
               <h4 className="text-lg font-bold">Comments ({getPrimaryComments().length})</h4>
            </div>

            {session && !replyingTo && (
               <form className="mb-6" onSubmit={handleMessageSubmit} ref={inputRef}>
                  <div className="p-0 m-0 relative rounded-xs bg-base-200 pb-[64px]">
                     <label htmlFor="comment" className="sr-only">
                        Your comment
                     </label>
                     <textarea
                        id="comment"
                        name="message"
                        rows="3"
                        className="rounded-xs p-6 w-full text-sm bg-base-200 focus:outline-none focus:ring-2 focus:ring-accent focus:bg-base-300 transition-all"
                        placeholder="Write a comment..."
                        required
                     />
                     <div className="card-actions justify-end absolute right-3.5 bottom-4">
                        <Button content="Post comment" />
                     </div>
                  </div>
               </form>
            )}

            {!session && (
               <div className="mb-6 p-4 bg-base-200 rounded-xs text-center">
                  <Link
                     to={routes.login}
                     state={{ from: location }}
                     className="text-primary hover:underline"
                  >
                     Please login to post a comment
                  </Link>
               </div>
            )}

            <div className="space-y-0">
               {getPrimaryComments().length > 0 ? (
                  getPrimaryComments().map((comment) => (
                     <CommentWithReplies key={comment.id} comment={comment} />
                  ))
               ) : (
                  <p className="text-center text-gray-500 py-8">
                     No comments yet. Be the first to comment!
                  </p>
               )}
            </div>
         </div>
      </section>
   );
};