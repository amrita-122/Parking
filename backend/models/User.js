const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: function () {
      return this.provider ? false : true;
    },
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  provider: {
    type: String,
    enum: ["local", "google", null],
    default: "local",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },

    phoneNumber: {
        type: String,
        required: function () {
      return this.provider ? false : true;
    },
        unique: true,
        validate: {
            validator: function(v) {
                return /^[0-9]{10}$/.test(v);
            },
            message: props => `${props.value} is not a valid Phone Number!`
        }
    },
    cars: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Car"
    }]
});

module.exports = mongoose.model("User", UserSchema);
