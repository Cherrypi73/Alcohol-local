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
    let endereco = document.getElementById("endereco").value;
    const tx = await db.transaction('localizacao', 'readwrite');
    const store = tx.objectStore('localizacao');
    try {
        
        await store.add({endereco: endereco,latitude: latitude, horario: horario, descricao: descricao, avaliacao: avaliacao, longitude:longitude });
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
                            keyPath: 'descricao'
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
            return `<div class="listando">
                   
                    <p>Nome: ${localizacao.descricao}</p>
                    <p>Horario de funcionamento: ${localizacao.horario} </p>
                    <p>Avaliação: ${localizacao.avaliacao}</p>
                    <p>Endereço: ${localizacao.endereco}</p>
                    <p>Localização</p>
                    <iframe id="mapinha" src="http://maps.google.com/maps?q=${localizacao.latitude},${localizacao.longitude}&z=16&output=embed" frameborder="0" scrolling="no" style="width: 300px; height: 300px;"></iframe>
                            <style>.mapouter{position:relative;height:300px;width:300px;background:#fff;} .maprouter a{color:#fff !important;position:absolute !important;top:0 !important;z-index:0 !important;}</style>
                            <style>.gmap_canvas{overflow:hidden;height:300px;width:300px}.gmap_canvas iframe{position:relative;z-index:2}</style>
                    

                   </div>`;
        });
        listagem(listar.join(' '));
    } 
}



async function deletar(){
    let descricao = document.getElementById("descricao").value;
    const tx = await db.transaction('localizacao', 'readwrite');
    const store = tx.objectStore('localizacao');
    
    try {
        let lista = await store.get(descricao);
        if(lista){
        await store.delete(descricao);
        await tx.done;
        alert('Anotação removido com sucesso!')
        console.log('Anotação deletada com sucesso!');
        limparCampos()
    } else{
            console.log('nao encontrado')
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
    document.getElementById("longitude").value = '';
    document.getElementById("horario").value = '';
    document.getElementById("descricao").value = '';
    document.getElementById("avaliacao").value = '';
    document.getElementById("endereco").value = '';

}



const capturarLocalizacao =  document.getElementById('localizacao');



//callback de sucesso para captura da posicao
const sucesso = () => {
  const iframe = document.getElementById('mapinha')
  let lat, lon;
  lat =   latitude
  lon =  longitude

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
  navigator.geolocation.watchPosition(sucesso, erro);
});
function listagem(text){
    document.getElementById('informacao').innerHTML = text;
}