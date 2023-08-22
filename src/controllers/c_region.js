import axios from "axios";
import Messages from "../utils/messages.js";
import { API_REGION } from "../configs/secret.js";

const provinces = (req, res) => {
  axios
    .get(`${API_REGION}/provinces.json`)
    .then((response) => {
      Messages(res, 200, "Success", response.data);
    })
    .catch((error) => {
      Messages(res, error.response.status, error.message);
    });
};
const regencies = (req, res) => {
  const id = parseInt(req.params.id);

  if (!id) return Messages(res, 404, "ID Province not Found", []);
  axios
    .get(`${API_REGION}/regencies/${id}.json`)
    .then((response) => {
      Messages(res, 200, "Success", response.data);
    })
    .catch((error) => {
      Messages(res, error.response.status, error.message);
    });
};
const districts = (req, res) => {
  const id = parseInt(req.params.id);

  if (!id) return Messages(res, 404, "ID Regencies not Found", []);
  axios
    .get(`${API_REGION}/districts/${id}.json`)
    .then((response) => {
      Messages(res, 200, "Success", response.data);
    })
    .catch((error) => {
      Messages(res, error.response.status, error.message);
    });
};
const villages = (req, res) => {
  const id = parseInt(req.params.id);

  if (!id) return Messages(res, 404, "ID Districts not Found", []);
  axios
    .get(`${API_REGION}/villages/${id}.json`)
    .then((response) => {
      Messages(res, 200, "Success", response.data);
    })
    .catch((error) => {
      Messages(res, error.response.status, error.message);
    });
};

export { provinces, regencies, districts, villages };
