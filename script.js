const workouts = document.querySelector(".workouts");
const workoutsForm = document.querySelector(".form");
const maps = document.getElementById("map");
const formInputType = document.querySelector(".form__input--type");
const fInputDistance = document.querySelector(".form__input--distance");
const fInputDuration = document.querySelector(".form__input--duration");
const fInputCadence = document.querySelector(".form__input--cadence");
const fInputElavtion = document.querySelector(".form__input--elevation");
const formBtn = document.querySelector(".form__btn");

// workout
class Workout {
  constructor(coords, distance, duration) {
    this.distance = distance;
    this.duration = duration;
    this.coords = coords;
    this.date = new Date();
    this.id = this.date.getMilliseconds();
  }
}
// child class running
class Running extends Workout {
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.type = "running";
    this.calcPace();
  }
  calcPace() {
    this.pace = this.duration / this.distance;
  }
}
// child class cycling
class Cycling extends Workout {
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.type = "cycling";
    this.calcSpeed();
  }
  calcSpeed() {
    this.speed = this.distance / (this.duration / 60);
  }
}
// class app starting
class App {
  AllWorkouts = [];
  constructor() {
    this.workouts;
    this._getPosition();
    this.coords2;
    workouts.addEventListener("click", this._moveMarker.bind(this));
    this._getLocalstorage();
    this.map;
  }
  _getPosition() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),
        () => "not reachable"
      );
    }
  }
  _loadMap(position) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;
    // let newCoords = [latitude, longitude];
    // map view
    this.map = L.map("map", {
      center: [latitude, longitude],
      zoom: 14,
    });
    L.tileLayer("https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "© OpenStreetMap",
    }).addTo(this.map);
    this.AllWorkouts.forEach((val) => {
      this._mapMarker(val);
    });
    this._showForm();
  }
  _showForm() {
    this.map.on(
      "click",
      function (e) {
        // form is dispayed

        workoutsForm.classList.remove("hidden");

        fInputDistance.focus();
        let { lat, lng } = e.latlng;
        this.coords2 = [lat, lng];

        // lat and lng
      }.bind(this)
    );
    this._toggleEleveationField();
    this._newWorkout();
  }
  _toggleEleveationField() {
    formInputType.addEventListener("change", function () {
      fInputCadence.closest(".form__row").classList.toggle("form__row--hidden");
      fInputElavtion
        .closest(".form__row")
        .classList.toggle("form__row--hidden");
    });
  }
  _renderWorkout(workout) {
    let newdate = workout.date.toString().slice(0, 10);
    let html = `<li class="workout workout--${workout.type}" data-id=${
      workout.id
    }>
    <h2 class="workout__title">${workout.type} on ${newdate}</h2>
    <div class="workout__details">
      <span class="workout__icon">${
        workout.type === "running" ? "🏃‍♂️" : "🚴‍♀️"
      }</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>
    `;
    // adding accordingly if running or cycling
    if (workout.type === "running")
      html += `<div class="workout__details">
    <span class="workout__icon">⚡️</span>
    <span class="workout__value"> ${workout.pace.toFixed(1)} </span>
    <span class="workout__unit">min/km</span>
  </div>
  <div class="workout__details">
    <span class="workout__icon">🦶🏼</span>
    <span class="workout__value"> ${workout.cadence} </span>
    <span class="workout__unit">spm</span>
  </div>`;
    if (workout.type === "cycling")
      html += `
      <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">${workout.speed.toFixed(1)}</span>
            <span class="workout__unit">km/h</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⛰</span>
            <span class="workout__value">${workout.elevationGain}</span>
            <span class="workout__unit">m</span>
          </div>
  `;
    workoutsForm.insertAdjacentHTML("afterend", html);
    // workoutsForm.classList.add("hidden");
    workoutsForm.classList.add("hidden");

    // resetting everything
    fInputDistance.value =
      fInputDuration.value =
      fInputDuration.value =
      fInputCadence.value =
      fInputElavtion.value =
        "";
  }
  _mapMarker = (workout1) => {
    let currentdate = workout1.date.toString().slice(4, 10);
    L.marker(workout1.coords)
      .addTo(this.map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout1.type}-popup`,
        })
      )
      .setPopupContent(`${workout1.type} on ${currentdate}`)
      .openPopup();
  };
  _newWorkout() {
    // valid number checking function
    function validChecking(...input) {
      return input.every((val) => Number.isFinite(val));
    }
    let validCheckingNumber = function (...input) {
      return input.every((val) => val > 0);
    };
    workoutsForm.addEventListener(
      "keypress",
      function (e) {
        // the entered key is enter
        if (e.key !== "Enter") return;
        e.preventDefault();
        // get data from form
        let type = formInputType.value;

        let distance = +fInputDistance.value;
        let duration = +fInputDuration.value;
        if (type === "running") {
          let cadence = +fInputCadence.value;
          if (
            !validChecking(distance, duration, cadence) ||
            !validCheckingNumber(distance, duration)
          )
            return alert("Not a valid Input");
          // getting data from workout running
          this.workouts = new Running(
            this.coords2,
            distance,
            duration,
            cadence
          );
        }
        if (type === "cycling") {
          let elevation = +fInputElavtion.value;
          if (
            !validChecking(distance, duration, elevation) ||
            !validCheckingNumber(distance, duration)
          )
            return alert("Not a valid Input");
          // getting cycling data
          this.workouts = new Cycling(
            this.coords2,
            distance,
            duration,
            elevation
          );
        }
        // lastly pushing to the array
        this._renderWorkout(this.workouts);
        this._mapMarker(this.workouts);
        this.AllWorkouts.push(this.workouts);
        this._setLocalstorage();
      }.bind(this)
    );
  }
  _moveMarker(e) {
    let parentElement = e.target.closest(".workout");
    if (!parentElement) return;
    let dataId = parentElement.getAttribute("data-id");
    let selectedEleemnt = this.AllWorkouts.find(
      (val) => String(val.id) === dataId
    );
    this.map.setView(selectedEleemnt.coords, 14, {
      animate: true,
      pan: {
        duration: 1,
      },
    });
  }
  _setLocalstorage() {
    // set the local storage
    localStorage.setItem("workout", JSON.stringify(this.AllWorkouts));
  }
  _getLocalstorage() {
    let workoutData = JSON.parse(localStorage.getItem("workout"));
    if (!workoutData) return;
    this.AllWorkouts = workoutData;
    workoutData.forEach((val) => {
      this._renderWorkout(val);
    });
  }
}

let newobj = new App();

// check navigator and take the coord latitute and longitude

// event listener on change
