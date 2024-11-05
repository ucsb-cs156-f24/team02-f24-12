const menuItemReviewFixtures = {
  oneMenuItemReview: {
    id: 1,
    itemId: 1,
    reviewerEmail: "a@ucsb.edu",
    stars: 5,
    dateReviewed: "2022-01-02T12:00:00",
    comments: "This is my first review",
  },
  threeMenuItemReviews: [
    {
      id: 1,
      itemId: 1,
      reviewerEmail: "b@ucsb.edu",
      stars: 5,
      dateReviewed: "2022-01-02T12:00:00",
      comments: "This is my first review",
    },
    {
      id: 2,
      itemId: 2,
      reviewerEmail: "c@ucsb.edu",
      stars: 4,
      dateReviewed: "2022-04-03T12:00:00",
      comments: "This is my second review",
    },
    {
      id: 3,
      itemId: 3,
      reviewerEmail: "d@ucsb.edu",
      stars: 3,
      dateReviewed: "2022-07-04T12:00:00",
      comments: "This is my third review",
    },
  ],
};

export default menuItemReviewFixtures;
