import { ROUTES_PATH } from "../constants/routes.js";
import Logout from "./Logout.js";

export default class NewBill {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    const formNewBill = this.document.querySelector(
      `form[data-testid="form-new-bill"]`
    );
    formNewBill.addEventListener("submit", this.handleSubmit);
    const file = this.document.querySelector(`input[data-testid="file"]`);
    file.addEventListener("change", this.handleChangeFile);
    this.fileUrl = null;
    this.fileName = null;
    this.billId = null;
    new Logout({ document, localStorage, onNavigate });
  }
  handleChangeFile = () => {
    const file = this.document.querySelector(`input[data-testid="file"]`);
    // Recupére le nom du fichier
    const fileName = file.files[0].name;
    // Regex pour l'extension de fichiers
    const regexExtensionGranted = /\.(jpg|jpeg|png)$/i;
    // Sélectionne le message d'erreur
    const errorMessage = this.document.querySelector(".error-message");

    // Vérifie si l'extension du fichier est autorisée
    if (!regexExtensionGranted.test(fileName)) {
      // Si l'extension du fichier n'est pas autorisée, affiche un message d'erreur
      errorMessage.innerText =
        "Seuls les fichiers jpg, jpeg, et png sont autorisés.";
      // Réinitialise le champ du fichier
      file.value = "";
    } else {
      // Supprime le message d'erreur si l'extension est valide
      errorMessage.innerText = "";
      return;
    }
  };
  handleSubmit = (e) => {
    e.preventDefault();
    console.log(
      'e.target.querySelector(`input[data-testid="datepicker"]`).value',
      e.target.querySelector(`input[data-testid="datepicker"]`).value
    );
    const email = JSON.parse(localStorage.getItem("user")).email;
    const bill = {
      email,
      type: e.target.querySelector(`select[data-testid="expense-type"]`).value,
      name: e.target.querySelector(`input[data-testid="expense-name"]`).value,
      amount: parseInt(
        e.target.querySelector(`input[data-testid="amount"]`).value
      ),
      date: e.target.querySelector(`input[data-testid="datepicker"]`).value,
      vat: e.target.querySelector(`input[data-testid="vat"]`).value,
      pct:
        parseInt(e.target.querySelector(`input[data-testid="pct"]`).value) ||
        20,
      commentary: e.target.querySelector(`textarea[data-testid="commentary"]`)
        .value,
      fileUrl: this.fileUrl,
      fileName: this.fileName,
      status: "pending",
    };

    // Déplacement de 74 à 94 placé initialement dans hadleChangeFile vers handleSubmit
    // Pour récupérer et mettre à jour les données au moment de l'envoie et non au changement du fichier
    const formData = new FormData();
    formData.append("file", file);
    formData.append("email", email);

    this.store
      .bills()
      .create({
        data: formData,
        headers: {
          noContentType: true,
        },
      })
      .then(({ fileUrl, key }) => {
        console.log(fileUrl);
        this.billId = key;
        this.fileUrl = fileUrl;
        this.fileName = file.name;
        this.updateBill(bill);
        this.onNavigate(ROUTES_PATH["Bills"]);
      })
      .catch((error) => console.error(error));
  };

  // not need to cover this function by tests
  updateBill = (bill) => {
    if (this.store) {
      this.store
        .bills()
        .update({ data: JSON.stringify(bill), selector: this.billId })
        .then(() => {
          this.onNavigate(ROUTES_PATH["Bills"]);
        })
        .catch((error) => console.error(error));
    }
  };
}
