import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"


export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    const buttonNewBill = document.querySelector(`button[data-testid="btn-new-bill"]`)
    if (buttonNewBill) buttonNewBill.addEventListener('click', this.handleClickNewBill)
    const iconEye = document.querySelectorAll(`div[data-testid="icon-eye"]`)
    if (iconEye) iconEye.forEach(icon => {
      icon.addEventListener('click', () => this.handleClickIconEye(icon))
    })
    new Logout({ document, localStorage, onNavigate })
  }

  handleClickNewBill = () => {
    this.onNavigate(ROUTES_PATH['NewBill'])
  }

  handleClickIconEye = (icon) => {
    const billUrl = icon.getAttribute("data-bill-url")
    const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
    $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
    $('#modaleFile').modal('show')
  }

  // Je crée une fonction de tri par date de bills 
  // Méthode sortByDate qui prend en paramètre un tableau de factures (bills)
  sortByDate = (bills) => {
    // Méthode sort() utilisée pour trier le tableau de factures
    return bills.sort((a, b) => {
      // Conversion des dates de chaque facture en objets Date pour comparaison
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      // Retourne la différence entre les dates de b et a
      // Ce qui a pour effet de trier le tableau dans l'ordre décroissant de date
      return dateB - dateA;
    });
  }
  

  getBills = () => {
    if (this.store) {
      return this.store
      .bills()
      .list()
      .then(snapshot => {
        const bills = snapshot
          .map(doc => {
            try {
              return {
                ...doc,
                date: formatDate(doc.date),
                status: formatStatus(doc.status)
              }
            } catch(e) {
              // if for some reason, corrupted data was introduced, we manage here failing formatDate function
              // log the error and return unformatted date in that case
              console.log(e,'for',doc)
              return {
                ...doc,
                date: doc.date,
                status: formatStatus(doc.status)
              }
            }
          })
        // Rtourne les factures triées par date
        return this.sortByDate(bills);
      })
    }
  }
}