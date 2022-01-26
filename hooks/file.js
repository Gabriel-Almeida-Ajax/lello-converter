import { createContext, useContext, useState, useCallback } from 'react';
import { useApi } from "../hooks/api";
import { useForm } from './form';

const FileContext = createContext();

export const FileProvider = ({ children }) => {
    const { postApi } = useApi();

    const [key, setKey] = useState();
    const [files, setFiles] = useState([]);
    const [filesR, setFilesR] = useState([]);

    const { form } = useForm();

    const loader = useCallback((file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();

            reader.onerror = () => {
                return alert('Não foi possível ler o arquivo.')
            };

            reader.onload = (e) => {
                const data = e.target.result;

                postApi('/api/convert', { xml: `${data}`, ...form })
                    .then(_response => {

                        // if (!!_response.tables.length) _response.tables.forEach(table => download({ ...table, name: file.name.split('.')[0] + '_' + table.name }))

                        resolve({ text: _response.conteudo.text, name: file.name.split('.')[0], tables: _response.tables });
                    })
                    .catch(error => {
                        alert('Não foi possível ler o arquivo.')
                        reject(error);
                    });


                setKey(Math.random());
            };

            reader.readAsText(file);
        });
    }, [form, postApi]);

    const download = useCallback(async (res) => {
        const resBlob = await res.text;

        let url = // 'data:text/plain;charset=utf-8,' + encodeURIComponent(data)
            window.URL.createObjectURL(
                new Blob([resBlob], { type: 'text/plain' })
            )

        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
            'download',
            `${res.name}.csv`,
        );


        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();
        setFilesR(old => ([...old, { name: res.name + ".csv" }]));

        // Clean up and remove the link
        link.parentNode.removeChild(link);
    }, [setFilesR])

    const fileLoader = useCallback(
        ({ target }) => {
            if (target.files.length) {
                setFiles(old => ([...old, ...target.files]))

                if (form.type === 'S-2240') {
                    return Promise.allSettled([...target.files].map(async file => await loader(file))).then(res => {

                        // make a concat content of all files per result table name
                        const concat = res.reduce((acc, cur) => {
                            if (cur.status === 'fulfilled') {
                                console.log(cur)
                                // concat table CON
                                if (cur.value.tables.filter(table => /(CON)([_])/.test(table.name)).length) {
                                    let table = cur.value.tables.filter(table => /(CON)([_])/.test(table.name))[0];
                                    acc.CON.text += table.text + "\n"
                                    acc.CON.name = table.name
                                };

                                // concat table FRC
                                if (cur.value.tables.filter(table => /(FRC)([_])/.test(table.name)).length) {
                                    let table = cur.value.tables.filter(table => /(FRC)([_])/.test(table.name))[0];
                                    acc.FRC.text += table.text + "\n"
                                    acc.FRC.name = table.name
                                };

                                // concat table RRA
                                if (cur.value.tables.filter(table => /(RRA)([_])/.test(table.name)).length) {
                                    let table = cur.value.tables.filter(table => /(RRA)([_])/.test(table.name))[0];
                                    acc.RRA.text += table.text + "\n"
                                    acc.RRA.name = table.name
                                };

                                // concat table EPI
                                if (cur.value.tables.filter(table => /(EPI)([_])/.test(table.name)).length) {
                                    let table = cur.value.tables.filter(table => /(EPI)([_])/.test(table.name))[0]
                                    acc.EPI.text += table.text + "\n"
                                    acc.EPI.name = table.name
                                };
                            }
                            return acc;
                        }, { CON: { text: '', name: '' }, FRC: { text: '', name: '' }, RRA: { text: '', name: '' }, EPI: { text: '', name: '' } });

                        download({ ...concat.CON });
                        download({ ...concat.FRC });
                        download({ ...concat.RRA });
                        if (concat.EPI.text) download({ ...concat.EPI });
                    })
                }
                if (form.type === 'S-2220') {
                    return Promise.allSettled([...target.files].map(async file => await loader(file))).then(res => {

                        // make a concat content of all files per result table name
                        const concat = res.reduce((acc, cur) => {
                            if (cur.status === 'fulfilled') {
                                // concat table ASO
                                if (cur.value.tables.filter(table => /(ASO)([_])/.test(table.name)).length) {
                                    let table = cur.value.tables.filter(table => /(ASO)([_])/.test(table.name))[0];
                                    acc.ASO.text += table.text + "\n"
                                    acc.ASO.name = table.name
                                };

                                // concat table EXA
                                if (cur.value.tables.filter(table => /(EXA)([_])/.test(table.name)).length) {
                                    let table = cur.value.tables.filter(table => /(EXA)([_])/.test(table.name))[0];
                                    acc.EXA.text += table.text + "\n"
                                    acc.EXA.name = table.name
                                };

                            }
                            return acc;
                        }, { ASO: { text: '', name: '' }, EXA: { text: '', name: '' } });

                        download({ ...concat.ASO });
                        download({ ...concat.EXA });
                    })
                }

                return [...target.files].map(async file => download(await loader(file)));
            }

            alert('Nenhum arquivo selecionado.');
        },
        [download, loader],
    )

    const provider = {
        key,
        files,
        filesR,
        download,
        fileLoader,
    }

    return (
        <FileContext.Provider value={provider}>
            {children}
        </FileContext.Provider>
    )
}

export const useFile = () => {
    const context = useContext(FileContext);

    if (!context) {
        throw new Error('useFile must be used within an FileProvider');
    }

    return context;
}