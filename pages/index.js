import { useRef, useState } from "react"
import { useFile } from "../hooks/file";
import { useForm } from "../hooks/form";


export default function Home() {
  const { fileLoader, key, files, filesR } = useFile();
  const { handleInterface, options } = useForm();

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
      <div style={{ height: '100vh', margin: '30px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
        <input key={key} onChange={fileLoader} accept=".xml" multiple type="file" />

        <select style={{ margin: '30px 0 0' }} onChange={handleInterface} name="interface" id="interface">
          <option value="" selected>Selecione uma interface</option>
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
                  <h6>{file.name}</h6>
                </div>
              ))
            }
          </div>
          <div style={{ margin: '30px' }}>
            <h5>Arquivos Convertidos</h5>
            {
              filesR.map((file) => (
                <div key={file.name}>
                  <h6>{file.name}</h6>
                </div>
              ))
            }
          </div>
        </div>
      </div>
    </div>
  )
}
