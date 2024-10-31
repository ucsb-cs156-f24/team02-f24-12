const recommendationRequestFixtures = {
  oneRecommendationRequest: {
    id: 1,
    requesterEmail: "javinzipkin@gmail.com",
    professorEmail: "ethelcain@ucsb.edu",
    explanation: "Its just not my year, but Im all good out here.",
    dateRequested: "2020-10-31T00:00:00",
    dateNeeded: "2020-12-31T00:00:00",
    done: false,
  },
  threeRecommendationRequests: [
    {
      id: 1,
      requesterEmail: "javinzipkin@gmail.com",
      professorEmail: "ethelcain@ucsb.edu",
      explanation: "It's just my year, but I'm not good out here!",
      dateRequested: "2021-10-31T00:00:00",
      dateNeeded: "2022-12-31T00:00:00",
      done: false,
    },
    {
      id: 2,
      requesterEmail: "ethelcain@gmail.com",
      professorEmail: "charlixcx@ucsb.edu",
      explanation: "Listen to my album.",
      dateRequested: "2021-10-31T00:00:00",
      dateNeeded: "2022-12-31T00:00:00",
      done: true,
    },
    {
      id: 3,
      requesterEmail: "avamax@gmail.com",
      professorEmail: "dualipa@ucsb.edu",
      explanation: "Are we going to fall off the charts this year?",
      dateRequested: "2024-10-31T00:00:00",
      dateNeeded: "2030-12-31T00:00:00",
      done: true,
    },
  ],
};
export { recommendationRequestFixtures };
