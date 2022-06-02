import db from "../db/models/index.js";

const isEqual = (a, b) => {
  if (a.length !== b.length) return false;
  const uniqueValues = new Set([...a, ...b]);
  for (const v of uniqueValues) {
    const aCount = a.filter((e) => e === v).length;
    const bCount = b.filter((e) => e === v).length;
    if (aCount !== bCount) return false;
  }
  return true;
};

export default class MeetingService {
  async createMeeting(groupId, meeting) {
    const meetingRecord = await db.Meeting.create({
      title: meeting.title,
      start: meeting.start,
      end: meeting.end,
      allDay: meeting.allDay,
    });
    const groupRecord = await db.Group.findByPk(groupId);
    await groupRecord.addMeeting(meetingRecord);

    for await (const place of meeting.places) {
      db.Place.create({
        name: place.name,
        coord: place.coord,
      }).then((place) => {
        meetingRecord.addPlace(place);
      });
    }

    for await (const user of meeting.users) {
      db.User.findByPk(user).then((user) => {
        meetingRecord.addUser(user);
      });
    }

    for await (const activity of meeting.activities) {
      db.Activity.findOne({
        where: {
          category: activity,
        },
      }).then((activity) => {
        meetingRecord.addActivity(activity, { through: "MeetingActivities" });
      });
    }

    return meetingRecord;
  }

  async readMeeting(meetingId) {
    const meetingRecord = await db.Meeting.findOne({
      where: {
        id: meetingId,
      },
      attributes: {
        exclude: ["createdAt", "updatedAt"],
      },
      include: {
        model: db.Post,
        as: "posts",
      },
    });
    if (!meetingRecord) {
      throw new Error("Meeting not found!");
    }
    return meetingRecord;
  }

  async updateMeeting(meetingId, meeting) {
    const meetingRecord = await db.Meeting.update(
      {
        title: meeting.title,
        start: meeting.start,
        end: meeting.end,
        allDay: meeting.allDay,
      },
      { where: { id: meetingId } }
    );

    if (!meetingRecord) {
      throw new Error("Meeting not found!");
    }

    const placeRecord = await meetingRecord.getPlaces();
    if (!isEqual(placeRecord, meeting.places)) {
      for await (const place of placeRecord) {
        db.Place.destroy({
          where: {
            id: place.id,
          },
        });
      }

      for await (const place of meeting.places) {
        db.Place.create({
          name: place.name,
          coord: place.coord,
        }).then((place) => {
          meetingRecord.addPlace(place);
        });
      }
    }

    const userRecord = await meetingRecord.getUsers();
    if (!isEqual(userRecord, meeting.users)) {
      for await (const user of userRecord) {
        db.User.findByPk(user).then((user) => {
          meetingRecord.removeUser(user);
        });
      }

      for await (const user of meeting.users) {
        db.User.findByPk(user).then((user) => {
          meetingRecord.addUser(user);
        });
      }
    }

    const activityRecord = await meetingRecord.getActivities();
    if (!isEqual(activityRecord, meeting.activities)) {
      for await (const activity of activityRecord) {
        db.Activity.findOne({
          where: {
            category: activity,
          },
        }).then((activity) => {
          meetingRecord.removeActivity(activity, {
            through: "MeetingActivities",
          });
        });
      }

      for await (const activity of meeting.activities) {
        db.Activity.findOne({
          where: {
            category: activity,
          },
        }).then((activity) => {
          meetingRecord.addActivity(activity, {
            through: "MeetingActivities",
          });
        });
      }
    }

    return meetingRecord;
  }

  async deleteMeeting(meetingId) {
    const meetingRecord = await db.Meeting.findByPk(meetingId);
    if (!meetingRecord) {
      throw new Error("Meeting not found!");
    }
    const placeRecord = await meetingRecord.getPlaces();
    for await (const place of placeRecord) {
      db.Place.destroy({
        where: {
          id: place.id,
        },
      });
    }
    await db.Meeting.destroy({
      where: {
        id: meetingId,
      },
    });
    return meetingRecord;
  }

  async findPlaces(meetingId) {
    const meetingRecord = await db.Meeting.findByPk(meetingId);
    if (!meetingRecord) {
      throw new Error("Meeting not found!");
    }
    const placeRecord = await meetingRecord.getPlaces();
    return placeRecord;
  }

  async findUsers(meetingId) {
    const meetingRecord = await db.Meeting.findByPk(meetingId);
    if (!meetingRecord) {
      throw new Error("Meeting not found!");
    }
    const userRecord = await meetingRecord.getUsers();
    return userRecord;
  }

  async findActivities(meetingId) {
    const meetingRecord = await db.Meeting.findByPk(meetingId);
    if (!meetingRecord) {
      throw new Error("Meeting not found!");
    }
    const activityRecord = await meetingRecord.getActivities();
    return activityRecord;
  }

  async findPosts(meetingId) {
    const meetingRecord = await db.Meeting.findByPk(meetingId);
    if (!meetingRecord) {
      throw new Error("Meeting not found!");
    }
    const posts = await meetingRecord.getPosts();
    const postRecord = [];
    for await (const post of posts) {
      const answers = await post.getAnswers();
      for await (const answer of answers) {
        const question = await db.Question.findByPk(answer.questionId);
        postRecord.push({ question: question, answer: answer });
      }
    }
    return postRecord;
  }

  async findComments(meetingId) {
    const meetingRecord = await db.Meeting.findByPk(meetingId);
    if (!meetingRecord) {
      throw new Error("Meeting not found!");
    }
    const commentRecord = await meetingRecord.getComments();
    return commentRecord;
  }
}
