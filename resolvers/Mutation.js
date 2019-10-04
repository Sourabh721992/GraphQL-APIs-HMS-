const Room = require("../models/Room");
const RoomBooking = require("../models/RoomBooking");
const Person = require("../models/Person");

let arrRoom = [];
const Mutation = {
  addRooms: async (parent, { numberOfRooms }, ctx, info) => {
    const arrRooms = await addRooms(numberOfRooms);
    return arrRooms;
  },
  bookRoom: async (parent, { data }, ctx, info) => {
    const room = await bookRoom(data);
    return room;
  },
  cancelBookings: async (parent, { bookingId }, ctx, info) => {
    const bookingDetail = await deleteBookingDetails(bookingId);
    return bookingDetail;
  }
};

function deleteBookingDetails(bookingId) {
  try {
    return new Promise((resolve, reject) => {
      RoomBooking.findOneAndDelete({
        _id: { $eq: bookingId }
      })
        .then(deletedBooking => {
          return resolve(deletedBooking);
        })
        .catch(err => {
          console.log(err);
          return reject(err);
        });
    });
  } catch (err) {
    console.log(err);
  }
}

function bookRoom(data) {
  try {
    return new Promise((resolve, reject) => {
      //Check for the person details in the mongodb.
      //If not present add the same and if present, verify and update its details.
      //Storing the same for future reference. Treating contactNumber as unique for person.
      Person.findOne({ contactNumber: data.contactNumber })
        .then(person => {
          //This states that person exist in our database
          if (person) {
            //Book room for the person
            let bookingDetails = new RoomBooking({
              personId: person._id,
              roomId: data.roomId,
              checkInDt: data.epochCheckInDt,
              checkOutDt: data.epochCheckOutDt
            });
            //Save the booking details in database
            bookingDetails
              .save()
              .then(details => {
                //Fetch the room information and send it to the user
                Room.findById(data.roomId)
                  .then(room => {
                    return resolve(room);
                  })
                  .catch(err => {
                    console.log(err);
                    return reject(err);
                  });
              })
              .catch(err => {
                console.log(err);
                return reject(err);
              });
          } else {
            //Save details of perosn in our db and then nook room
            let person = new Person({
              personName: data.personName,
              contactNumber: data.contactNumber
            });

            person
              .save()
              .then(person => {
                let bookingDetails = new RoomBooking({
                  personId: person._id,
                  roomId: data.roomId,
                  checkInDt: data.epochCheckInDt,
                  checkOutDt: data.epochCheckOutDt
                });
                //Save the booking details in database
                bookingDetails
                  .save()
                  .then(details => {
                    //Fetch the room information and send it to the user
                    Room.findById(data.roomId)
                      .then(room => {
                        return resolve(room);
                      })
                      .catch(err => {
                        console.log(err);
                        return reject(err);
                      });
                  })
                  .catch(err => {
                    console.log(err);
                    return reject(err);
                  });
              })
              .catch(err => {
                console.log(err);
                return reject(err);
              });
          }
        })
        .catch(err => {
          return reject(err);
        });
    });
  } catch (err) {
    console.log(err);
  }
}

function addRooms(numberOfRooms) {
  try {
    return new Promise((resolve, reject) => {
      Room.count().then(count => {
        for (let i = count; i < numberOfRooms + count; i++) {
          let room = new Room({
            name: "Room " + i,
            type: "A"
          });
          arrRoom.push(room);

          room
            .save()
            .then(room => {})
            .catch(err => {
              console.log(err);
              reject(false);
            });
          if (i == numberOfRooms + count - 1) {
            return resolve(arrRoom);
          }
        }
      });
    });
  } catch (error) {
    Console.log(error);
  }
}

module.exports = Mutation;
