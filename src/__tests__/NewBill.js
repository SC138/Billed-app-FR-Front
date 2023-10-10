/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { list } from "../__mocks__/store.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

// Définition de la fonction onNavigate
const onNavigate = (pathname) => {
  // Mise à jour du HTML en fonction du chemin
  document.body.innerHTML = ROUTES({ pathname });
};
// Avant chaque test:
beforeEach(() => {
  // Définir le localStorage mocké sur l'objet window
  Object.defineProperty(window, "localStorage", { value: localStorageMock });
  // Ajout d'un user mocké au localStorage
  window.localStorage.setItem(
    "user",
    JSON.stringify({
      type: "Employee",
      email: "employee@test.tld",
    })
  );
  // Définit le HTML avec l'interface user de Newbill
  document.body.innerHTML = NewBillUI();
});

// Bloc de description : Étant donné que je suis connecté en tant qu'employé
describe("Given I am connected as an employee", () => {
  // Bloc de description : Quand je suis sur la page NewBill
  describe("When I am on NewBill Page", () => {
    // Ensuite, test pour vérifier que l'entrée de fichier déclenche la fonction handleChangeFile lors de la sélection de fichier
    test("Then file input should trigger handleChangeFile on file selection ", () => {
      // Obtention HTML de l'interface user NewBill
      const html = NewBillUI();
      // Définition du HTML avec l'interface user NewBill
      document.body.innerHTML = html;

      // Mock de la fonction onNavigate
      const mockOnNavigate = jest.fn();
      // Création d'une instance mock de la class NewBill
      const mockNewBill = new NewBill({
        document,
        onNavigate: mockOnNavigate,
        store: { bills: list },
        localStorage: localStorageMock,
      });

      // Mock de l'event
      const mockEvent = { preventDefault: jest.fn() };
      // Espionnage de la méthode handleChangeFile
      const spyHandleChangeFile = jest.spyOn(mockNewBill, "handleChangeFile");
      // Obtention de l'élément d'entrée de fichier
      const fileInput = screen.getByTestId("file");

      // Création d'un fichier mocké
      const file = new File(["Test d'envoie"], "Test.jpg", {
        type: "image/jpg",
      });

      // Définit la propriété files de fileInput
      Object.defineProperty(fileInput, "files", { value: [file] });
      // Déclenchement de l'event "change" sur fileInput
      fireEvent.change(fileInput);
      // Appel de la méthode handleChangeFile avec l'event mocké
      mockNewBill.handleChangeFile(mockEvent);
      // Vérification que handleChangeFile a été appelée
      expect(spyHandleChangeFile).toHaveBeenCalled();
    });

    // Test de vérification qu'une erreur est retournée si extension de fichier incorrecte
    //Ensuite j'ajoute un fichier avec la mauvaise extension, le programme doit renvoyer une erreur
    test("Then I add a file with the wrong extension, the program must return an error", async () => {
      // Obtention HTML de l'interface user NewBill
      const html = NewBillUI();
      // Définition du HTML avec l'interface user NewBill
      document.body.innerHTML = html;

      // Création d'une instance mock de la class NewBill
      const mockNewBill = new NewBill({
        document: window.document,
        onNavigate: jest.fn(),
        store: null,
        localStorage: null,
      });

      // Obtention de l'élément d'entrée de fichier
      const fileInput = screen.getByTestId("file");

      // Création d'un fichier mocké avec une mauvaise extension
      const file = new File(["Test d'envoie"], "Test.pdf", {
        type: "application/pdf",
      });

      // Définit la propriété files de fileInput
      Object.defineProperty(fileInput, "files", { value: [file] });
      // Appel de la méthode handleChangeFile avec l'event mocké
      mockNewBill.handleChangeFile({ target: fileInput });
      // Attend que l'erreur soit affichée
      await waitFor(() => {
        // vérification du message d'erreur
        expect(document.querySelector(".error-message").innerText).toBe(
          "Seuls les fichiers jpg, jpeg, et png sont autorisés."
        );
      });
    });
  });
});

// Suite de tests d'intégration pour NewBill
describe("NewBill integration test suit", () => {
  // Bloc de description pour un employé connecté
  describe("Given I am connected as an employee", () => {
    // Bloc de description pour être sur la page NewBill
    describe("When I am on NewBill Page", () => {
      // Test pour vérifier la soumission du formulaire de nouvelle facture et la redirection vers la page de factures
      test("Then I submit completed new bill form and I am redirected on bill, method post", async () => {
        // Initialisation du contenu HTML avec un div root
        document.body.innerHTML = `<div id="root"></div>`;

        // Appel de la fonction router pour configurer la navigation
        router();

        // Navigation vers la page NewBill
        window.onNavigate(ROUTES_PATH.NewBill);

        // Obtention et difinition des éléments du formulaire
        const name = screen.getByTestId("expense-name");
        name.value = "Transports";
        const date = screen.getByTestId("datepicker");
        date.value = "2023-09-10";
        const amount = screen.getByTestId("amount");
        amount.value = "350";
        const vat = screen.getByTestId("vat");
        vat.value = "30";
        const pct = screen.getByTestId("pct");
        pct.value = "70";

        // Botention de l'élement d'entrée de fichier
        const fileInput = screen.getByTestId("file");
        // Déclenchement de l'event "change" sur fileInput
        fireEvent.change(fileInput, {
          target: {
            files: [
              // Création d'un ficheir mocké
              new File(["image.png"], "image.png", { type: "image/png" }),
            ],
          },
        });

        // Obtention du formulaire de soumission
        const submitForm = screen.getByTestId("form-new-bill");

        // Création d'une instance mock de la class NewBill
        const mockNewBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        // Mock de la fonction handleSubmit
        const handleSubmit = jest.fn((e) => mockNewBill.handleSubmit(e));

        // Ajout d'un écouteur d'event "submit" au formulaire
        submitForm.addEventListener("submit", handleSubmit);

        //Déclenchement de l'event "submit" sur le formulaire
        fireEvent.submit(submitForm);

        // Vérification que handleSubmit a été appelée
        expect(handleSubmit).toHaveBeenCalled();

        // Attend que le texte "Mes notes de frais" soit présent dans le DOM
        await waitFor(() => {
          // Vérification du texte
          expect(screen.getByText("Mes notes de frais")).toBeInTheDocument();
        });

        // Vérification de la présence du bouton "New Bill" dans le DOM
        expect(screen.getByTestId("btn-new-bill")).toBeTruthy();
      });
    });
  });
});
