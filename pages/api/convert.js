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
      return output;
    },
    async 'S-2240'(input) {
      let output = input;

      return new Promise((resolve, reject) => {
        input.eSocial.evtExpRisco.forEach(risco => {
          let promises = risco.infoExpRisco.map(async info => {
            return await getValeusToCsv(info);
          })
          
          incricao = risco.ideEmpregador.nrInsc.replace(/[^0-9]/g, '');

          Promise.allSettled(promises)
            .then(result => {
              tables = result.map(process => ({ ...process.value.conteudo, name: 'AN_' + incricao + `_${new Date().toISOString().split('.')[0].replace('T', '_').replace(':', 'H').replace(':', 'M') + 'S'}` }));
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

  let data = replacer(replacer(replacer(replacer(replacer(csv, '}'), ']'), '{'), '['), ',', ';')

  let head = []
  data = data.split(';').map(text => {
    let splited = text.split(':')
    head.push(splited[splited.length - 2])
    return splited[splited.length - 1]
  }).join(';')

  return Promise.resolve({
    conteudo: {
      text: head.join(';') + '\n' + data,
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
