import { openDB } from "idb";

let db;

window.addEventListener('DOMContentLoaded', async event =>{
    criarDB();
    document.getElementById('btnCadastro').addEventListener('click', Cadastrarlocalizacao);
    document.getElementById('btnCarregar').addEventListener('click', listar);
    document.getElementById('btnDeletar').addEventListener('click', deletar);
 
});

async function Cadastrarlocalizacao() {
    let latitude = document.getElementById("latitude").value;
    let longitude = document.getElementById("longitude").value;
    let descricao = document.getElementById("descricao").value;
    let horario = document.getElementById("horario").value;
    let avaliacao = document.getElementById("avaliacao").value;
    const tx = await db.transaction('localizacao', 'readwrite');
    const store = tx.objectStore('localizacao');
    try {
        
        await store.add({latitude: latitude, horario: horario, descricao: descricao, avaliacao: avaliacao, longitude:longitude });
        await tx.done;
        limparCampos();
        alert('Anotação cadastrada com sucesso!')
        console.log('Registro adicionado com sucesso!');
      
    } catch (error) {
        console.error('Erro ao Cadastrar registro:', error);
        tx.abort();
    }
}

async function criarDB(){
    try {
        db = await openDB('banco', 1, {
            upgrade(db, oldVersion, newVersion, transaction){
                switch  (oldVersion) {
                    case 0:
                    case 1:
                        const store = db.createObjectStore('localizacao', {
                            keyPath: 'latitude'
                        });
                        store.createIndex('id', 'id');
                        listagem("banco de dados criado!");
                }
            }
        });
        listagem("banco de dados aberto!");
    }catch (e) {
        listagem('Erro ao criar/abrir banco: ' + e.message);
    }
}



async function listar(){
    if(db == undefined){
        console.log("O banco de dados está fechado.");
    }
    const tx = await db.transaction('localizacao', 'readonly');
    const store = await tx.objectStore('localizacao');
    const lista = await store.getAll();
    if(lista){
        const listar = lista.map(localizacao => {
            return `<div>
                    <p>Localização</p>
                     ${localizacao.horario} </p>
                    <p>${localizacao.descricao}</p>
                    <p>${localizacao.avaliacao}</p>
                    
                   </div>`;
        });
        listagem(listar.join(' '));
    } 
}

async function deletar(){
    let latitude = document.getElementById("latitude").value;
    const tx = await db.transaction('localizacao', 'readwrite');
    const store = tx.objectStore('localizacao');
    
    try {
        let lista = await store.get(latitude);
        if(lista){
        await store.delete(latitude);
        await tx.done;
        alert('Anotação removido com sucesso!')
        console.log('Anotação deletada com sucesso!');
        limparCampos()
    } else{
            console.log('nnao encontrado')
            alert('Não foi encontrado no Banco de dados')
            limparCampos();
        } 
    } catch (error) {
        console.error('Erro ao deletar:', error);
        tx.abort();
    }
}



function limparCampos() {
    document.getElementById("latitude").value = '';
    document.getElementById("descricao").value = '';
    document.getElementById("data").value = '';

}


let posicaoInicial;
const capturarLocalizacao = document.getElementById('localizacao');
const latitude = document.getElementById('latitude');
const longitude = document.getElementById('longitude');
const iframe = document.getElementById('mapa')

//callback de sucesso para captura da posicao
const sucesso = (posicao) => {
  posicaoInicial = posicao;
  let lat, lon;
  lat = posicaoInicial.coords.latitude;
  lon = posicaoInicial.coords.longitude;
  latitude.innerHTML = lat;
  longitude.innerHTML = lon;
  iframe.src = `http://maps.google.com/maps?q=${lat},${lon}&z=16&output=embed`
};

//callback de error (falha para captura de localizacao)
const erro = (error) => {
  let errorMessage;
  switch(error.code){
    case 0:
      errorMessage = "Erro desconhecido"
    break;
    case 1:
      errorMessage = "Permissão negada!"
    break;
    case 2:
      errorMessage = "Captura de posição indisponível!"
    break;
    case 3:
      errorMessage = "Tempo de solicitação excedido!"
    break;
  }
  console.log('Ocorreu um erro: ' + errorMessage);
};

capturarLocalizacao.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(sucesso, erro);
});
function listagem(text){
    document.getElementById('informacao').innerHTML = text;
}