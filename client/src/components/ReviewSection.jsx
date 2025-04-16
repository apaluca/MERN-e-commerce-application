import { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";

const StarRating = ({ rating, setRating, readOnly = false }) => {
  const [hover, setHover] = useState(0);

  return (
    <div className="flex">
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <button
            type="button"
            key={index}
            className={`${readOnly ? "cursor-default" : "cursor-pointer"} text-2xl leading-none p-1 focus:outline-none`}
            onClick={() => !readOnly && setRating(starValue)}
            onMouseEnter={() => !readOnly && setHover(starValue)}
            onMouseLeave={() => !readOnly && setHover(0)}
          >
            <span
              className={`${
                (hover || rating) >= starValue
                  ? "text-yellow-400"
                  : "text-gray-300"
              }`}
            >
              ★
            </span>
          </button>
        );
      })}
    </div>
  );
};

const ReviewForm = ({ productId, onReviewAdded }) => {
  const { API, setError } = useAppContext();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [justSubmitted, setJustSubmitted] = useState(false);

  useEffect(() => {
    // Check if the user has purchased the product and hasn't reviewed it yet
    const checkEligibility = async () => {
      try {
        const orders = await API.get("/orders");

        // Check if user has purchased this product AND the order is delivered
        const purchased = orders.data.some(
          (order) =>
            order.items.some(
              (item) =>
                item.product === productId ||
                (item.product._id && item.product._id === productId),
            ) && order.status === "delivered", // Only delivered orders qualify
        );

        setHasPurchased(purchased);

        if (purchased) {
          // Check if user has already reviewed this product
          const reviews = await API.get(`/reviews/user`);
          const alreadyReviewed = reviews.data.some(
            (review) =>
              review.product._id === productId ||
              (typeof review.product === "string" &&
                review.product === productId),
          );

          setHasReviewed(alreadyReviewed);
        }
      } catch (error) {
        console.error("Error checking review eligibility:", error);
        // Don't set an error here to avoid showing error messages when the user first loads the page
      }
    };

    checkEligibility();
  }, [API, productId]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    if (comment.trim() === "") {
      setError("Please enter a review comment");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await API.post(`/reviews/${productId}`, {
        rating,
        comment,
      });

      // Reset form
      setRating(0);
      setComment("");

      // Show success message instead of immediately showing "already reviewed"
      setJustSubmitted(true);

      // Pass the new review up to parent to add to the list
      onReviewAdded(response.data);

      // Hide success message after 5 seconds
      setTimeout(() => {
        setJustSubmitted(false);
        setHasReviewed(true); // Only set this after timeout
      }, 5000);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (hasReviewed && !justSubmitted) {
    return (
      <div className="mt-6 bg-blue-50 p-4 rounded-md">
        <p className="text-blue-700">
          You've already reviewed this product. Thank you for your feedback!
        </p>
      </div>
    );
  }

  if (justSubmitted) {
    return (
      <div className="mt-6 bg-green-50 p-4 rounded-md">
        <p className="text-green-700">
          Thank you! Your review has been successfully submitted.
        </p>
      </div>
    );
  }

  if (!hasPurchased) {
    return (
      <div className="mt-6 bg-gray-50 p-4 rounded-md">
        <p className="text-gray-700">
          You can only leave a review after purchasing and receiving this
          product.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-gray-50 p-4 rounded-md">
      <h3 className="text-lg font-medium text-gray-900 mb-2">Write a Review</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rating
          </label>
          <StarRating rating={rating} setRating={setRating} />
        </div>

        <div className="mb-4">
          <label
            htmlFor="comment"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Your Review
          </label>
          <textarea
            id="comment"
            rows="4"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Share your experience with this product..."
          ></textarea>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:opacity-50"
        >
          {isSubmitting ? "Submitting..." : "Submit Review"}
        </button>
      </form>
    </div>
  );
};

const ReviewItem = ({ review }) => {
  const date = new Date(review.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <div className="border-b border-gray-200 py-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <div className="font-medium text-gray-900">
            {review.user.username}
          </div>
          <span className="mx-2 text-gray-300">•</span>
          <div className="text-sm text-gray-500">{date}</div>
        </div>
        <StarRating rating={review.rating} readOnly={true} />
      </div>
      <p className="text-gray-700">{review.comment}</p>
    </div>
  );
};

const ReviewSection = ({ productId }) => {
  const { API } = useAppContext();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.get(`/reviews/product/${productId}`);
      setReviews(response.data);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      setError("Unable to load reviews at this time.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [API, productId]);

  const handleReviewAdded = (newReview) => {
    setReviews((prevReviews) => [newReview, ...prevReviews]);
  };

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Customer Reviews
      </h2>

      <ReviewForm productId={productId} onReviewAdded={handleReviewAdded} />

      <div className="mt-8">
        {error ? (
          <div className="text-center py-4">
            <p className="text-red-500">{error}</p>
          </div>
        ) : loading ? (
          <div className="text-center py-4">
            <div className="text-gray-500">Loading reviews...</div>
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-4">
            <p className="text-gray-500">
              No reviews yet. Be the first to review this product!
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center mb-4">
              <div className="text-lg font-medium text-gray-900 mr-2">
                {reviews.length} Review{reviews.length !== 1 ? "s" : ""}
              </div>
              {reviews.length > 0 && (
                <div className="flex items-center">
                  <span className="text-yellow-400 text-lg mr-1">★</span>
                  <span className="text-gray-700">
                    {(
                      reviews.reduce((acc, review) => acc + review.rating, 0) /
                      reviews.length
                    ).toFixed(1)}
                  </span>
                </div>
              )}
            </div>
            {reviews.map((review) => (
              <ReviewItem key={review._id} review={review} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewSection;
