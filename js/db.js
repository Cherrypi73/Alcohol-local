import { openDB } from "idb";
let db;
async function criarDB() {
    try {
        db = await openDB('banco', 1, {
            upgrade(db, oldVersion, newVersion, transaction) {
                switch (oldVersion) {
                    case 0:
                    case 1:
                        const store = db.createObjectStore('bars', {
                            keyPath: 'titulo' 
                        });
                        store.createIndex('id', 'id');
                        console.log("Banco de dados criado!");
                }
            }
        })
        console.log("banco de dados aberto!");
    } catch (e) {
        console.log('Erro ao criar/abrir banco: ' + e.message);
    }
}


window.addEventListener('DOMContentLoaded', async event =>{
    criarDB();
    document.getElementById('btnCadastrar').addEventListener('click', cadastrar);
    document.getElementById('btnCarregar').addEventListener('click', buscarlocalizacao);
    document.getElementById('btnListar').addEventListener('click', listar);
    document.getElementById('btndeletar').addEventListener('click', deletar);
});


async function cadastrar() {
    let horario = document.getElementById("horario").value;
    let avaliacao = document.getElementById("avaliacao").value;
    let latitude = document.getElementById("latitude").value;
    let longitude = document.getElementById("longitude").value;
    const tx = await db.transaction('bars', 'readwrite');
    const store = tx.objectStore('bars');
    try {
        await store.add({  horario: horario, avaliacao: avaliacao,  longitude: longitude,latitude: latitude });
        await tx.done;
        limparCampos();
        alert('Anotação cadastrada com sucesso!')
        console.log('Registro adicionado com sucesso!');
      
    } catch (error) {
        console.error('Erro ao adicionar registro:', error);
        tx.abort();
    }
}
async function buscarlocalizacao(){
    if(db == undefined){
        console.log("O banco de dados está fechado.");
    }
    const tx = await db.transaction('anotacao', 'readonly');
    const store = await tx.objectStore('anotacao');
    const anotacoes = await store.getAll();
    if(anotacoes){
        const divLista = anotacoes.map(anotacao => {
            return `<div class="item">
                    <p>Anotação</p>
                    <p>${anotacao.titulo} - ${anotacao.data} </p>
                    <p>${anotacao.descricao}</p>
                    <p>${anotacao.categoria}</p>
                    
                   </div>`;
        });
        listagem(divLista.join(' '));
    } 
}

async function deletar(){
    let titulo = document.getElementById("titulo").value;
    const tx = await db.transaction('anotacao', 'readwrite');
    const store = tx.objectStore('anotacao');
    
    try {
        let objBuscado = await store.get(titulo);
        if(objBuscado){
        await store.delete(titulo);
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
async function listar(){
    let titulo = document.getElementById("titulo").value;
    const tx = await db.transaction('anotacao', 'readwrite');
    const store = tx.objectStore('anotacao');
    try {
        let objBuscado = await store.get(titulo);
        if (objBuscado){
            await tx.done;
            document.getElementById('descricao').value = objBuscado.descricao;
            document.getElementById('data').value = objBuscado.data;
            document.getElementById('categoria').value = objBuscado.categoria;
            console.log('Buscado com sucesso!');
            
        } else{
            console.log('nnao encontrado')
            alert('Não foi encontrado no Banco de dados')
            limparCampos();
        } 
    } catch (error) {
        console.error('Erro a atualizar:', error);
        tx.abort();
    }
}
function limparCampos() {
    document.getElementById("latitude").value = '';
    document.getElementById("longitude").value = '';
    document.getElementById("horario").value = '';
    document.getElementById("avaliacao").value = '';

}

function listagem(text){
    document.getElementById('resultados').innerHTML = text;
}














const capturarLocalizacao = document.getElementById('localizacao');
const map = document.getElementById('mapa');

const sucesso = () => {
    const latitude = document.getElementById('latitude');
    const longitude = document.getElementById('longitude');
  map.src = "http://maps.google.com/maps?q=" + latitude + "," +longitude + "&z=16&output=embed";
}

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
      errorMessage = "Permissão negada!"
    break;
    case 3:
      errorMessage = "Permissão negada!"
    break;
    }
    console.log('Ocorreu um erro:'+ errorMessage);
};

capturarLocalizacao.addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition(sucesso, erro);
});