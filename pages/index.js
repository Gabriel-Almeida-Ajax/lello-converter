import Head from 'next/head'

import { useRef, useState } from "react"
import { useFile } from "../hooks/file";
import { useForm } from "../hooks/form";



export default function Home() {
  const { fileLoader, key, files, filesR } = useFile();
  const { handleInterface, options } = useForm();

  return (<>
    <Head>
      <title>Lello - eSocial Conversor XML to CSV</title>
      <link rel="icon" href="https://www.lellocondominios.com.br/wp-content/uploads/2017/01/cropped-Icon-192x192.png" />
    </Head>
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ height: '100vh', margin: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <input key={key} onChange={fileLoader} accept=".xml" multiple type="file" />

        <select style={{ margin: '30px 0 0' }} onChange={handleInterface} name="interface" id="interface">
          <option value="default" selected>Selecione uma interface</option>
          {
            options.map(option => (
              <option key={option.type} value={option.type}>{option.type}</option>
            ))
          }
        </select>

      </div>
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', alignItems: 'center' }}>

        <div style={{ display: 'flex', margin: '0 auto', justifyContent: 'space-around' }}>
          <div style={{ margin: '30px' }}>
            <h5>Arquivos Carregados</h5>
            {
              files.map((file) => (
                <div key={file.name}>
                  <h6 key={file.name}>{file.name}</h6>
                </div>
              ))
            }
          </div>
          <div style={{ margin: '30px' }}>
            <h5>Arquivos Convertidos</h5>
            {
              filesR.map((file) => (
                <div key={file.name}>
                  <h6 key={file.name}>{file.name}</h6>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  </>);
}
