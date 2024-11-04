const helpRequestFixtures = {
    oneHelpRequest: {
        id: 1,
        requesterEmail: "cgaucho@ucsb.edu",
        teamId: "team1",
        tableOrBreakoutRoom: "table",
        requestTime: "2022-01-02T12:00:00",
        explanation: "github issues",
        solved: "yes",

    },
    threeHelpRequests: [
    {
        id: 1,
        requesterEmail: "cgaucho@ucsb.edu",
        teamId: "team1",
        tableOrBreakoutRoom: "table",
        requestTime: "2022-01-02T12:00:00",
        explanation: "github issues",
        solved: "yes",
    },
    {
        id: 2,
        requesterEmail: "ucsbfan@ucsb.edu",
        teamId: "team2",
        tableOrBreakoutRoom: "breakout room",
        requestTime: "2022-02-02T12:00:00",
        explanation: "bugs in code",
        solved: "no",
    },
    {
        id: 2,
        requesterEmail: "ucsbfan@ucsb.edu",
        teamId: "team2",
        tableOrBreakoutRoom: "breakout room",
        requestTime: "2022-02-02T12:00:00",
        explanation: "bugs in code",
        solved: "no",
    },
    {
        id: 3,
        requesterEmail: "storkie@ucsb.edu",
        teamId: "team3",
        tableOrBreakoutRoom: "table",
        requestTime: "2022-03-02T12:00:00",
        explanation: "code too lit",
        solved: "yes",
    },
    ],

    };

    export { helpRequestFixtures };