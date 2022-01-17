import { ApiProvider } from '../hooks/api'
import { FileProvider } from '../hooks/file'
import { FormProvider } from '../hooks/form'
import '../styles/globals.css'

function MyApp({ Component, pageProps }) {
  return (
    <ApiProvider>
      <FormProvider>
        <FileProvider>
          <Component {...pageProps} />
        </FileProvider>
      </FormProvider>
    </ApiProvider>
  )
}

export default MyApp
