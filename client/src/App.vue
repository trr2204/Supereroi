<template>
<!-- CORREGGI METODO OTTIENIPOTERI() PERCHE DALLA TENDINA SPUNTANO FUORI NON TUTTI I POTERI NEL DATABASE MA SOLO QUELLI FILTRATI-->
  <div>
    <div @click="disattivaModifica()"> 
      <h3>Client</h3>
      <div>
        Username:
        <input v-model="username"/>
        Password:
        <input v-model="password"/>
        <button @click="verificaCredenziali()">Accedi</button>
        <hr>

      </div>

      Aggiungi eroe:
      <input v-model="campoTesto"/>
      <div/>
      Aggiungi potere:
      <input v-model="campoPotere">
      <button v-if="(campoTesto != '') && (campoPotere != '')" @click="aggiungiEroe()">Aggiungi</button>
      <ul class="errori">
        <li v-if="campoTesto === ''">Devi scrivere qualcosa nel campo del nome!</li>
        <li v-if="campoPotere === ''">Devi scrivere qualcosa nel campo dei superpoteri!</li>
      </ul>
    </div>
    <hr>
    Filtra in base al superpotere
    <select v-model="potereFiltrare">
      <option></option>
      <option v-for="poteri in elencoPoteriFinestrella" :key="poteri._id">{{poteri}}</option>
    </select>
    <hr>
    <table class="tabella">
      <tr v-for="eroe in heroes" :key="eroe._id">  <!-- tr sono le righe-->
          <td> <!-- td sono le colonne-->
            <div class="testoEroi" v-if="modalitaModificaId != eroe._id" @click="modificaNomeEroe(eroe)"> {{eroe.nome}} </div>
            <div v-else>
                <input v-model="casellaNomeEroe"/>
                <button @click="modificaEroe(eroe._id)"> Aggiorna</button>
            </div>
          </td> 
          

          <ul>
            <li v-for="poteri in eroe.superpoteri" :key="poteri._id">
              <div v-if="(modificaElencoPoteri != poteri) || (modificaElencoPoteriEroe != eroe._id)" 
              @click="modificaElencoPoteriFunzione(poteri, eroe)">
                {{poteri}}
              </div>
              <div v-else>
                <input v-model="casellaRinominaPoteri"/>
                <button @click="modificaNomePoteri(eroe)">Conferma</button>
                <button @click="eliminaPoteri(eroe)">Elimina</button>
              </div>
            </li>
            
            <input v-if="aggiuntaSuperpoteri === eroe._id" v-model="potereAggiungere"/>
            <button v-if="aggiuntaSuperpoteri === eroe._id" @click="aggiungiPotere(eroe._id)" >Conferma</button>

            <button v-if="aggiuntaSuperpoteri === null" @click="casellaModificaPoteri(eroe)">
              Aggiungi Potere
            </button>
          </ul>

          <td>
            <button @click="elimina(eroe._id)">
              Elimina eroe
            </button>
          </td>
          <hr>
          <hr>
      </tr>
    </table>
  
  </div>
</template>

<script>

export default {
mounted: function() {
  console.log("prova")
  this.caricaEroi()
  this.notifica()
  this.ottieniPoteri()  
},
watch: {
  potereFiltrare() {
  fetch(this.URL + '/mongodb/') 
    .then(f => f.json())
    .then(y => this.heroes = y)
    .then(() => {
    if (this.potereFiltrare === '') {
      
    } else {
      let filtro = []
      filtro = this.heroes.filter(v => v.superpoteri.includes(this.potereFiltrare))
      this.heroes = filtro
    }
  })
  },
  heroes() {
    this.ottieniPoteri()
  }
},
data: function() {
  return {
    heroes: [
      {nome: "vuoto", superpoteri: ['vuoto', 'vuoto2']}
    ],

    URL: 'http://87.16.44.228:8888',
    campoTesto: '',
    campoPotere: '',
    modalitaModificaId: null,
    casellaNomeEroe: '',
    aggiuntaSuperpoteri: null,
    potereAggiungere: '',
    modificaElencoPoteri: null,
    casellaRinominaPoteri: '',
    modificaElencoPoteriEroe: null,
    potereFiltrare: '',
    elencoPoteriFinestrella: [],
    username: '',
    password: ''
  }
},
methods: {
  verificaCredenziali: function() {
    if ((this.username != '') && (this.password != '')) {
      fetch(this.URL + '/login', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password
        })
      }).then(() => {console.log(this.username + " " + this.password)})
    }
  },
  ottieniPoteri: function() {
    let eroiTemporanei = []
    fetch(this.URL + '/mongodb/')
    .then(w => w.json())
    .then(e => eroiTemporanei = e)
    .then(() => {
    let risultato = []
    eroiTemporanei.forEach(element => {
      element.superpoteri.forEach(r => risultato.push(r))
    })
    this.elencoPoteriFinestrella = Array.from(new Set(risultato));
    }).catch("Errore")
  },
  eliminaPoteri: function(eroe) {
    const idEroe = eroe._id
    if (this.casellaRinominaPoteri != '') {
      fetch(this.URL + '/mongodb/' + idEroe, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          superpoteri: this.modificaElencoPoteri
        })
      }).then(() => {
        this.disattivaModifica()
        this.caricaEroi()
    })
    }
  },
  modificaElencoPoteriFunzione: function(poteri, eroe) {
    this.disattivaModifica()
    this.modificaElencoPoteriEroe = eroe._id
    this.modificaElencoPoteri = poteri
    this.casellaRinominaPoteri = poteri

  },
  modificaNomePoteri: function(eroe) {
    const idEroe = eroe._id
    if (this.casellaRinominaPoteri != '' && (this.modificaElencoPoteri != this.casellaRinominaPoteri)) {
      fetch(this.URL + '/mongodb/' + idEroe, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          originale: this.modificaElencoPoteri,
          superpoteri: this.casellaRinominaPoteri
        })
      }).then(() => {
        this.disattivaModifica()
        this.caricaEroi()
    })
    }
  },
  disattivaModifica: function() {
    this.aggiuntaSuperpoteri = null
    this.modalitaModificaId = null
    this.modificaElencoPoteri = null
  },
  modificaNomeEroe: function(eroe) {
    this.disattivaModifica()
    this.modalitaModificaId = eroe._id
    this.casellaNomeEroe = eroe.nome
  },
  elimina: function(idEroe) {
    fetch(this.URL + '/mongodb/' + idEroe, {
      method: 'DELETE'
    }).then(() => this.caricaEroi())
  },
  caricaEroi: function() {
    fetch(this.URL + '/mongodb/') 
    .then(f => f.json())
    .then(y => this.heroes = y)
  },
  notifica: function() {
    fetch(this.URL + '')
  },
  modificaEroe: function(idEroe) {
    if (this.casellaNomeEroe != '') {
      fetch(this.URL + '/mongodb/' + idEroe, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome: this.casellaNomeEroe
        })
      }).then(() => {
        this.disattivaModifica()
        this.caricaEroi()
      })
    } else {
      this.disattivaModifica();
    }
  },
  aggiungiEroe: function() {
    if (this.campoTesto != '' && this.campoPotere != '') {
      const eroeAggiungere = this.campoTesto
      const potereAggiungere = this.campoPotere
      fetch(this.URL + '/mongodb/', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          nome: eroeAggiungere,
          superpoteri: [potereAggiungere]
        })
      }).then(() => {
        this.campoTesto = ''
        this.campoPotere = ''
        this.caricaEroi()
      })
    }
  },
  casellaModificaPoteri: function(eroe) {
    this.disattivaModifica()
    this.aggiuntaSuperpoteri = eroe._id
  },
  aggiungiPotere: function(eroeId) {
    const potereAggiungereArray = this.potereAggiungere
    fetch(this.URL + '/mongodb/' + eroeId, {
      method: 'POST',
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        superpoteri: potereAggiungereArray
      })
    }).then(() => {
      this.potereAggiungere = ''
      this.aggiuntaSuperpoteri = null
      this.caricaEroi()
    })
  }

}
}
</script>

<style>
  .testoEroi {
      cursor: pointer;
      text-decoration: underline;
      font-size: 20px; 
  }
  .testoEroi:hover {
    color:cornflowerblue;
  }
  .tabella {
    background-color:khaki;
  }
  .errori {
    font-size: 13px;
    color:crimson
  }
</style>
