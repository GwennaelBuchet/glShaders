/**
 * Created by gwennael.buchet on 04/04/17.
 */
class Loader {

    constructor(idElt) {
        this.elt = document.getElementById(idElt);
        this.txtElt = this.elt.querySelector("#loaderText");
    };

    setText(txt) {
        this.txtElt.innerText = txt;
    };

    destroy(lowerElt) {
        lowerElt.style.display = "block";

        this.elt.parentNode.removeChild(this.elt);
    };

}