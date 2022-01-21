// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const { parseString } = require('xml2js');

function replacer(text, find, replace = '') {
  return text.split(find).join(replace)
}

async function getValeusToCsv(json, type = 'default') {
  let key = Object.keys(json)[0];
  let tables = [];
  delete json[key].$;

  const sanitize = {
    'S-2220'(input) {
      let output = input;
      return new Promise((resolve, reject) => {
        input.eSocial.evtMonit[0]?.exMedOcup.forEach(atendimento => {
          let inscricao = input.eSocial.evtMonit[0]?.ideEmpregador[0]?.nrInsc ?? 'InscricaoNaoIdentificada';
          if (!atendimento?.respMonit) {
            atendimento.respMonit = [{}]
          }

          if (!atendimento?.aso) {
            atendimento.aso = [{
              medico: [{}]
            }]
          }
          let exames = atendimento.aso[0].exame.map(exame => {
            return {
              a_ideImp: '02',
              b_numins: input.eSocial.evtMonit[0]?.ideEmpregador[0]?.nrInsc ?? [''],
              c_tipins: input.eSocial.evtMonit[0]?.ideEmpregador[0]?.tpInsc ?? [''],
              // d_cateso: input.eSocial.evtMonit[0]?.ideVinculo[0]?.codCateg ?? [''],
              // c_tipins: input.eSocial.evtMonit[0]?.ideEmpregador[0]?.tpInsc ?? [''],
              e_cpftra: input.eSocial.evtMonit[0]?.ideVinculo[0]?.cpfTrab ?? [''],

              f_datexa: exame.dtExm && new Date(exame.dtExm[0]).toLocaleDateString('pt-BR') || [''],
              g_prorea: exame.procRealizado ?? [''],
              h_obspro: exame.obsProc ?? [''],
              i_ordexa: exame.ordExame ?? [''],
              j_indres: exame.indResult ?? [''],
            }
          })
          let promises = [{
            ideImp: '01',
            ideeve: input.eSocial.evtMonit[0]?.$.Id,
            tipins: input.eSocial.evtMonit[0]?.ideEmpregador[0]?.tpInsc ?? [''],
            numins: input.eSocial.evtMonit[0]?.ideEmpregador[0]?.nrInsc ?? [''],
            cateso: input.eSocial.evtMonit[0]?.ideVinculo[0]?.codCateg ?? [''],
            cpftra: input.eSocial.evtMonit[0]?.ideVinculo[0]?.cpfTrab ?? [''],
            indret: input.eSocial.evtMonit[0]?.ideEvento[0]?.indRetif ?? [''],
            tipaso: atendimento?.tpExameOcup ?? [''],
            dataso: atendimento.aso[0]?.dtAso ? new Date(atendimento.aso[0]?.dtAso[0]).toLocaleDateString('pt-BR') : [''],
            resaso: atendimento.aso[0]?.resAso ?? [''],
            nommed: atendimento.aso[0]?.medico[0]?.nmMed ?? [''],
            nrcrmm: atendimento.aso[0]?.medico[0]?.nrCRM ?? [''],
            ufcrmm: atendimento.aso[0]?.medico[0]?.ufCRM ?? [''],
            cpfrsp: atendimento.respMonit[0]?.cpfResp ?? [''],
            nomrsp: atendimento.respMonit[0]?.nmResp ?? [''],
            numcom: atendimento.respMonit[0]?.nrCRM ?? [''],
            estcon: atendimento.respMonit[0]?.ufCRM ?? [''],
          }, exames].map(async info => {
            return await getValeusToCsv(info);
          })

          Promise.allSettled(promises)
            .then(result => {
              tables = result.map((process, i) => {
                let _conteudo = { ...process.value.conteudo }

                console.log(_conteudo.text)
                if (i) {
                  _conteudo.text = _conteudo.text.split(';02;').join(';\n\r02;');
                }
                let tfile = !i ? 'ASO_' : 'EXA_'
                return { ..._conteudo, name: tfile + inscricao + `_${new Date().toISOString().split('.')[0]?.replace('T', '_').replace(':', 'H').replace(':', 'M') + 'S'}` }
              });

              resolve(output);

            }).catch(error => {
              console.log({ error });
              resolve(output);

            });

        })

      });
    },
    async 'S-2240'(input) {
      let output = input;

      return new Promise((resolve, reject) => {
        input.eSocial.evtExpRisco.forEach(risco => {
          let incricao = risco.ideEmpregador[0]?.nrInsc[0];

          let promises = risco.infoExpRisco.map(async info => {
            return await getValeusToCsv(info);
          })


          Promise.allSettled(promises)
            .then(result => {
              tables = result.map(process => ({ ...process.value.conteudo, name: 'AN_' + incricao + `_${new Date().toISOString().split('.')[0]?.replace('T', '_').replace(':', 'H').replace(':', 'M') + 'S'}` }));
              resolve(output);

            }).catch(error => {
              console.log({ error });
              resolve(output);

            });

        })

      });
    },
    'default'(input) {
      let output = input;

      return output;
    },
  }
  let csv = JSON.stringify(await sanitize[type](json))


  // add a new line after each table

  let data = replacer(replacer(replacer(replacer(replacer(csv, '}'), ']'), '{'), '['), ',', ';')

  // let head = []
  data = replacer(data.split(';').map(text => {
    let splited = text.split(':')
    // head.push(splited[splited.length - 2])
    return splited[splited.length - 1]
  }).join(';'), '"', '')

  return Promise.resolve({
    conteudo: {
      text: data,
    },
    tables
  });
}

export default function handler(req, res) {

  if (req.method === 'POST') {
    let data = req.body.xml;

    parseString(data, async (err, result) => {
      if (result) {
        let csv = await getValeusToCsv(result, req.body.type);
        return res.status(201).send(csv);
      }

      res.status(400).json({ err });
    });

  }

  if (req.method === 'GET') {
    res.statusCode = 200;
    res.json({ message: 'Hello World' });
  }

}
