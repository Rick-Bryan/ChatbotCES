import venom from 'venom-bot'

import fs from "fs";
import { PdfReader } from "pdfreader";
import { PDFDocument } from 'pdf-lib';
import { saveLog } from './logs/logger.js';
import moment from "moment";


let filename = './funcionarios/COMPROVANTE DE RENDIMENTO CES VIGILANCIA 2022.pdf';
let dataAtual = moment().format('DD_MM_YYYY')
let horaAtual = moment().format('HH_mm_ss')
let currentPage = 0;
let rows = {};
let rowArray = []


venom.create({
    session: 'Chatbot C&S', //name of session
    multidevice: true // for version not multidevice use false.(default: true)
  })
  .then((client) => start(client))
  .catch((erro) => {
    console.log(erro);
  });

function start(client) {



  client.onMessage((message) => {
    const phoneNumber = message.from;
    
    

    if (message.body && message.isGroupMsg === false) {
        //client.sendText(phoneNumber,'Olá sou o assistente virtual da C&S como posso lhe ajudar? : \n [1] Procurar colaborador')
        
        const cpf = message.body
        const arquivodestino= cpf.replaceAll('.', '_').replaceAll('-', '_')
        parser(cpf,arquivodestino,phoneNumber)    
        //const phone = (client.getHostDevice()).id.user
        //console.log(phone)

        
        /*
      client
        .sendText(message.from, 'Welcome Venom 🕷')
        .then((result) => {
          console.log('Result: ', result); //return object success
        })
        .catch((erro) => {
          console.error('Error when sending: ', erro); //return object error
        });*/

    }}
  );




    async function parser(cpf,arquivodestino,phoneNumber) {
        try{
    function flushRows() {
        Object.keys(rows)
            .sort((y1, y2) => parseFloat(y1) - parseFloat(y2))
            .forEach(async (y) => {
                const rowText = (rows[y] || []).join('');
                rowArray = (rows[y] || []).join('');
                //console.log(currentPage,rowText)
                //let buscaCpf = rowText.substring(3,4)+rowText.substring(7,8)+rowText.substring(11,12)
                //let iteraCpf = rowText.substring(0,14)
                /*if(buscaCpf.includes(cpf)){

                    saveLog(`./logs/analise/sucess/teste.log`).error(
                        {
                            pagina: currentPage,
                            Nome:rowText.substring(14),
                            Cpf: rowText.substring(0,14)
                        }
                    )
                }else{
                    saveLog(`./logs/analise/error/teste.log`).error(
                        {
                            pagina: currentPage,      
                            Cpf: rowText.substring(0,14)
                        }
                    )
                }*/
                /*
                if (iteraCpf.includes(cpf)) {
                        console.log(`Found on page ${currentPage}: ${rowText}`);
                        // chamada da função extractPage()
                         
                        geralogSucess('Arquivo criado com sucesso')
                        
                        await extractPage(filename, `./cedulaC/${arquivodestino}.pdf`, currentPage);
                        enviaArquivo(chat,arquivodestino)
                        
                        
                              
                }  */
                if (rowText.includes(cpf)){
                    console.log(`Found on page ${currentPage}: ${rowText}`);
                    await extractPage(filename, `./cedulaC/${arquivodestino}.pdf`, currentPage);
                    enviaArquivo(arquivodestino,phoneNumber)
                }
            });

         if(!rowArray.includes(cpf)){
             geraLogErr("ERRO ao encontrar parametro")
         }
        rows = {};
    }
    

    new PdfReader().parseFileItems(filename, (err, item) => {
        if (err) {
            console.error({ err });
        } else if (!item) {
            console.log('End of PDF');

        } else if (item.text) {
            rows[item.y] = rows[item.y] || [];
            const words = item.text.split(/\s+/); // split text into an array of words
            rows[item.y].push(...words); // push each word individually to the row
        } else if (item.page) {
            flushRows();
            currentPage = item.page;
            //console.log(item)
        }
    });
        }
        catch(err){
            console.log(err)
        }
} 
//função que recorta a pagina do pdf
async function extractPage(inputPath, outputPath, pageNumber) {
    const pdfDoc = await PDFDocument.load(await fs.promises.readFile(inputPath))
    const newPdf = await PDFDocument.create()
    const [copiedPage] = await newPdf.copyPages(pdfDoc, [pageNumber - 1])
    newPdf.addPage(copiedPage)

    const extractedPdfBytes = await newPdf.save()

    await fs.promises.writeFile(outputPath, extractedPdfBytes)
}

function geraLogErr(msg) {
    saveLog(`./logs/error/${dataAtual}/${horaAtual}.log`).error(
        {
            Arquitetura: 'COMPROVANTE DE RENDIMENTO CES VIGILANCIA',
            Mensagem: msg,
        }
    )
}
function geralogSucess(msg) {
    saveLog(`./logs/sucess/${dataAtual}/${horaAtual}.log`).error(
        {
            Arquitetura: 'COMPROVANTE DE RENDIMENTO CES VIGILANCIA',
            Mensagem: msg
        }
    )
}
async function enviaArquivo(arquivodestino,phoneNumber){

        try{
            await client.sendFile(phoneNumber,`./cedulaC/${arquivodestino}.pdf`, `${arquivodestino}.pdf`)

        }
        catch(err){
        console.log(err)

        }
      
}
}