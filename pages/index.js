import { useRef, useState } from "react"
import { useFile } from "../hooks/file";


export default function Home() {
  const { fileLoader, key } = useFile();

  return (
    <div>
      <input key={key} onChange={fileLoader} accept=".xml" multiple type="file" />
      <hr />
    </div>
  )
}
