// State variable to prevent multiple concurrent load operations
let isLoading = false;

// Get the current page URL
const currentUrl = window.location.href;

// Check if infinite scroll is enabled based on a data attribute
const dataInfinite = document
  .querySelector("#devok-load-more")
  ?.getAttribute("data-infinite");


// Function to load more products dynamically
const devokLoadMore = async (button) => {
  // Prevent re-triggering the function if already loading
  if (isLoading || !button) return;
  isLoading = true;
  
  const loadMoreWrapper = document.querySelector("#devok-load-more");
  const gridContainer = document.querySelector(".product-grid");
  const loadMoreSpinner = loadMoreWrapper?.querySelector(".load-more__spinner");
  const paginationList = document.querySelector(".pagination");


  try {
    button.classList.add("hidden");
    gridContainer?.classList.add("loading");
    loadMoreSpinner?.classList.remove("hidden");
    
     const nextUrl = new URL(button.getAttribute("data-next-url"), currentUrl).href;

    const response = await fetch(nextUrl);
    if (!response.ok) {
      throw new Error(`HTTP error ${response.status}`);
    }

    const newPage = new DOMParser().parseFromString(await response.text(), "text/html");

    const newGridContent = newPage.querySelector("[data-grid-js]")?.innerHTML;
    if (newGridContent) {
      document.querySelector("[data-grid-js]").innerHTML += newGridContent;
    }

      // Reinitialize interactivity features
      activeCompare();
      activeWishlist();

      // Replace the load-more wrapper with the new one
      const newLoadMore = newPage.querySelector("#devok-load-more");
    if (newLoadMore) {
      loadMoreWrapper.replaceWith(newLoadMore);
    }


      // Update the pagination if present
      if (paginationList) {
        paginationList.replaceWith(newPage.querySelector(".pagination"));
      }
    
    
   // Trigger custom events for non-infinite scenarios
    const newPagination = newPage.querySelector(".pagination");
    if (newPagination && paginationList) {
      paginationList.replaceWith(newPagination);
    }

    if (dataInfinite === "false") {
      document.querySelector("#devok-load-more")?.dispatchEvent(new CustomEvent("devok.paginate.next"));
    }
  } catch (error) {
    console.error("Failed to load more products:", error);
  } finally {
    isLoading = false;
    gridContainer?.classList.remove("loading");
    loadMoreSpinner?.classList.add("hidden");
    button.classList.remove("hidden");
  }
};

// Function to handle infinite scroll
const handleInfiniteScroll = () => {
  const loadTarget = document.querySelector("#devok-load-more");
  if (!loadTarget || loadTarget.getAttribute("data-infinite") !== "true") return;

  const buttonTarget = loadTarget.querySelector("#devok-load-button");
  if (!buttonTarget) return;
    
    const scrollOffset = 100;   // Buffer distance to trigger load
    const targetScroll = loadTarget.offsetTop;
    const scrollPosition = window.innerHeight + window.pageYOffset;  

  if (scrollPosition >= targetScroll - scrollOffset) {
    devokLoadMore(buttonTarget);
  }
};


if (dataInfinite != "false") {
  window.addEventListener("scroll", handleInfiniteScroll);
}

// let intersectionObservers = []; // Declare the array globally

// const devokLoadMore = async (button) => {
//
//   try {
//

//
//     if (newPage) {
//       const grid = document.querySelector("[data-grid-js]");
//       const newItems = newPage.querySelectorAll("product-card");

//       // Lazy load new items
//       observeNewItems(newItems);

//       newItems.forEach((newItem) => {
//         if (!grid.contains(newItem)) {
//           grid.appendChild(newItem);
//         }
//       });

//     }

//   } catch (error) {
//     console.error("Failed to load more products:", error);
//   } finally {
//     isLoading = false;
//     document.documentElement.dispatchEvent(
//       new CustomEvent("theme:loading:end", { bubbles: true })
//     );
//   }
// };

// // Add this function to observe new items lazily
// const observeNewItems = (newItems) => {
//   newItems.forEach((newItem) => {
//     newItem.classList.add("pr-hidden");
//     const observer = new IntersectionObserver(
//       (entries) => {
//         entries.forEach((entry) => {
//           if (entry.isIntersecting) {
//             newItem.classList.remove("pr-hidden"); // Remove the "hidden" class when visible
//             newItem.classList.add("visible");
//           }
//         });
//       },
//       { threshold: 0.5 }
//     );

//     observer.observe(newItem);
//     intersectionObservers.push({ target: newItem, observer });
//   });
// };
