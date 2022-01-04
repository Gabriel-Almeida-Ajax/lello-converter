import { ApiProvider } from '../hooks/api'
import { FileProvider } from '../hooks/file'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <ApiProvider>
      <FileProvider>
        <Component {...pageProps} />
      </FileProvider>
    </ApiProvider>
  )
}

export default MyApp
