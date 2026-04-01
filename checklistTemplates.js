export const ChecklistTemplates = {

    nuotoBase: () => [
        { category: "Generale", name: "Occhialini" },
        { category: "Generale", name: "Muta" },
        { category: "Generale", name: "Cuffia" },
        { category: "Generale", name: "Ciabatte" }
    ],
    nuotoTriBase: () => [
        { category: "Nuoto", name: "Occhialini" },
        { category: "Nuoto", name: "Muta" },
        { category: "Nuoto", name: "Cuffia" },
        { category: "Nuoto", name: "Ciabatte" }
    ],

    ciclismoBase: () => [
        { category: "Generale", name: "Bici" },
        { category: "Generale", name: "Casco" },
        { category: "Generale", name: "Scarpe bici" },
        { category: "Generale", name: "Occhiali da sole" },
        { category: "Generale", name: "Borraccia" },
        { category: "Generale", name: "Pompetta bici" }
    ],

    ciclismoTriBase: () => [
        { category: "Ciclismo", name: "Bici" },
        { category: "Ciclismo", name: "Casco" },
        { category: "Ciclismo", name: "Scarpe bici" },
        { category: "Ciclismo", name: "Occhiali da sole" },
        { category: "Ciclismo", name: "Borraccia" },
        { category: "Ciclismo", name: "Pompetta bici" }
    ],

    corsaBase: () => [
        { category: "Generale", name: "Scarpe running" },
        { category: "Generale", name: "Occhiali da sole" },
        { category: "Generale", name: "Cappellino" },
        { category: "Generale", name: "Spille per numero di gara" }
    ],

    corsaTriBase: () => [
        { category: "Corsa", name: "Scarpe running" },
        { category: "Corsa", name: "Occhiali da sole" },
        { category: "Corsa", name: "Cappellino" }
    ],

    alimentazione: () => [
        { category: "Alimentazione", name: "Carbo gel" },
        { category: "Alimentazione", name: "Sali minerali" },
        { category: "Alimentazione", name: "Bottiglietta acqua pre gara" },
        { category: "Alimentazione", name: "Barretta" },
        { category: "Alimentazione", name: "Frutta secca" }
    ],

    prePostGara: () => [
        { category: "Pre/Post gara", name: "Tessera società" },
        { category: "Pre/Post gara", name: "Abbigliamento di ricambio" },
        { category: "Pre/Post gara", name: "Abbigliamento della squadra" },
        { category: "Pre/Post gara", name: "Asciugamano/Accappatoio" }
    ],

    transizioni: () => [
        { category: "Transizioni", name: "Portanumero" },
        { category: "Transizioni", name: "Elastici scarpe ciclismo" }
    ],

    triathlon() {
        return [
            ...this.nuotoTriBase(),
            ...this.ciclismoTriBase(),
            ...this.corsaTriBase(),
            ...this.transizioni(),
            ...this.alimentazione(),
            ...this.prePostGara()
        ]
    },

    nuoto() {
        return [
            ...this.nuotoBase(),
            ...this.alimentazione(),
            ...this.prePostGara()
        ]
    },

    ciclismo() {
        return [
            ...this.ciclismoBase(),
            ...this.alimentazione(),
            ...this.prePostGara()
        ]
    },

    corsa() {
        return [
            ...this.corsaBase(),
            ...this.alimentazione(),
            ...this.prePostGara()
        ]
    }

}