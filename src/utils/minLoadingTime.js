/**
 * @param {Function} asyncFn - The async function to execute
 * @param {number} minTime - Minimum time in milliseconds (default: 1500ms)
 * @returns {Promise} - Resolves after at least minTime has passed
*/

export async function minLoadingTime(asyncFn, minTime = 1500) {
   const start = Date.now();
   const result = await asyncFn();
   const elapsed = Date.now() - start;

   if (elapsed < minTime) {
      await new Promise(resolve => setTimeout(resolve, minTime - elapsed));
   }

   return result;
};