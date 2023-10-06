/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import BillsUI from "../views/BillsUI.js";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store";
import Bills from "../containers/Bills.js";
import router from "../app/Router.js";
jest.mock("../app/store", () => mockStore)


describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      );
      const root = document.createElement("div");
      root.setAttribute("id", "root");
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.Bills);
      await waitFor(() => screen.getByTestId("icon-window"));
      const windowIcon = screen.getByTestId("icon-window");
      //to-do write expect expression
      expect(windowIcon).toHaveClass("active-icon");
    });
    // Fonction antiChrono pour trier les dates en ordre antichronologique
    const antiChrono = (a, b) => new Date(b.date) - new Date(a.date);

    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills });

      // Utilise la fonction antiChrono pour trier le tableau 'bills' en ordre décroissant
      // (du plus récent au plus ancien) en utilisant la date de chaque élément pour le tri
      const billsSorted = bills.sort(antiChrono);
      // Récupère et stocke les dates du DOM dans le tableau 'dates'
      const dates = screen
        .getAllByText(
          /^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i
        )
        .map((a) => a.innerHTML);

      // Crée un nouveau tableau 'billsDates' en extrayant la date de chaque élément dans 'billsSorted'
      const billsDates = billsSorted.map((bill) => bill.date);

      // Vérifie si toutes les dates dans 'billsDates' sont présentes dans le tableau 'dates' en utilisant la méthode 'every'
      // 'every' renverra 'true' si toutes les dates de 'billsDates' sont trouvées dans 'dates', sinon 'false'
      const allDatesPresent = billsDates.every((date) => dates.includes(date));

      // Utilise une assertion (toBe) pour vérifier que 'allDatesPresent' est vrai, ce qui signifie que toutes les dates sont présentes
      // et que le code a fonctionné comme prévu
      expect(allDatesPresent).toBe(true);
    });


    // Test pour les notes de frais
    test("then I create a new expense report", () =>{
      const mockOnNavigate = jest.fn();
      const mockBills = new Bills({
        document: document,
        onNavigate: mockOnNavigate,
        store: null,
        localStorage: null
      });
      document.body.innerHTML = '<button type="button" data-testid="btn-new-bill" class="btn btn-primary">Nouvelle note de frais</button>';
      mockBills.handleClickNewBill();
      expect(mockOnNavigate).toHaveBeenCalledWith(ROUTES_PATH.NewBill);
    });

    // Test de l'affichage d'un fichier en cliquant sur l'icone oeil
    test("then I click on the eye icon to display a file", () =>{
      document.body.innerHTML = BillsUI({data: bills});

      const mockClick = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      });
      
      const modale = document.getElementById('modaleFile');
      $.fn.modal = jest.fn(()=> modale.classList.add('show'));
      const iconEye = screen.getAllByTestId('icon-eye')[0];

      const handleClickIconEye = jest.fn(mockClick.handleClickIconEye(iconEye));
      iconEye.addEventListener('click', handleClickIconEye());
      fireEvent.click(iconEye);

      expect(handleClickIconEye).toHaveBeenCalled();
    });
  });

  // Test d'intégration de la méthode GET pour GETBills
  describe("When an error occurs on API", () => {
    beforeEach(() => {
      jest.spyOn(mockStore, "bills")
      Object.defineProperty(
          window,
          'localStorage',
          { value: localStorageMock }
      )
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: "a@a"
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.appendChild(root)
      router()
    })
    test("fetches bills from an API and fails with 404 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 404"))
          }
        }})
      window.onNavigate(ROUTES_PATH.Dashboard)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })

    test("fetches messages from an API and fails with 500 message error", async () => {

      mockStore.bills.mockImplementationOnce(() => {
        return {
          list : () =>  {
            return Promise.reject(new Error("Erreur 500"))
          }
        }})

      window.onNavigate(ROUTES_PATH.Dashboard)
      await new Promise(process.nextTick);
      const message = await screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })

});
