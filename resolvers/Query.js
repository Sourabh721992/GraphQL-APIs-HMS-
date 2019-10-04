const Room = require("../models/Room");
const RoomBooking = require("../models/RoomBooking");

const Query = {
  checkAvailableRooms: async (
    parent,
    { epochCheckInDt, epochCheckOutDt },
    ctx,
    info
  ) => {
    if (
      epochCheckInDt * 1000 < Date.now() ||
      epochCheckOutDt * 1000 < Date.now()
    ) {
      throw new Error("Please select future dates");
    }
    if (epochCheckOutDt < epochCheckInDt)
      throw new Error("Checkout date should be greater than Checkin date");

    const rooms = await checkAvailableRooms(epochCheckInDt, epochCheckOutDt);
    return rooms;
  },
  checkBookingDetails: async (parent, { personId }, ctx, info) => {
    const bookingDetails = await bookingDetail(personId);
    return bookingDetails;
  }
};

function checkAvailableRooms(epochCheckInDt, epochCheckOutDt) {
  try {
    return new Promise((resolve, reject) => {
      RoomBooking.count()
        .then(count => {
          //count = 0, suggests that no rooms are booked till now.
          //So if rooms exist in the system, return all the rooms
          if (count == 0) {
            //Check rooms exist in the Database.
            //If not, ask the user to add rooms in the system.
            Room.count()
              .then(count => {
                if (count == 0) {
                  return reject("Request you to add rooms in the system");
                } else {
                  Room.find({}).then(rooms => {
                    return resolve(rooms);
                  });
                }
              })
              .catch(err => {
                console.log(err);
                reject(false);
              });
          } else {
            //get all the rooms that are booked for the future dates
            RoomBooking.find({
              $or: [
                {
                  checkOutDt: {
                    $gte: Math.trunc(Date.now() / 1000)
                  }
                },
                {
                  checkInDt: {
                    $gte: Math.trunc(Date.now() / 1000)
                  }
                }
              ]
            })
              .then(rooms => {
                //Check room which are already booked for the given period
                //and store there room IDs.
                let bookedRooms = [];
                for (let i = 0; i < rooms.length; i++) {
                  if (
                    epochCheckInDt >= rooms[i].checkInDt &&
                    epochCheckInDt < rooms[i].checkOutDt
                  )
                    bookedRooms.push(rooms[i].roomId);
                  else if (
                    epochCheckOutDt > rooms[i].checkInDt &&
                    epochCheckOutDt <= rooms[i].checkOutDt
                  )
                    bookedRooms.push(rooms[i].roomId);
                }
                let distinctBookedRooms = [...new Set(bookedRooms)];
                //Fetch all the rooms from mongoose with room id not in database
                Room.find({ _id: { $nin: distinctBookedRooms } })
                  .then(rooms => {
                    return resolve(rooms);
                  })
                  .catch(err => {
                    console.log(err);
                    return reject(err);
                  });
              })
              .catch(error => {
                console.log(error);
                return reject(error);
              });
          }
        })
        .catch(err => {
          console.log(err);
          reject(false);
        });
    });
  } catch (error) {
    console.log(error);
  }
}

function bookingDetail(pId) {
  try {
    return new Promise((resolve, reject) => {
      RoomBooking.find({
        $and: [
          { checkInDt: { $gte: Math.trunc(Date.now() / 1000) } },
          { personId: { $eq: pId } }
        ]
      })
        .then(bookingDetails => {
          return resolve(bookingDetails);
        })
        .catch(err => {
          console.log(err);
          return reject(err);
        });
    });
  } catch (error) {
    console.log(error);
  }
}

module.exports = Query;
