// Next.js API route support: https://nextjs.org/docs/api-routes/introduction

const { parseString } = require('xml2js');

function replacer(text, find, replace = '') {
  return text.split(find).join(replace)
}

async function getValeusToCsv(json) {
  let key = Object.keys(json)[0];

  delete json[key].$;

  let csv = JSON.stringify(json)

  let data = replacer(replacer(replacer(replacer(replacer(csv, '}'), ']'), '{'), '['), ',', ';')

  let head = []
  data = data.split(';').map(text => {
    let splited = text.split(':')
    head.push(splited[splited.length - 2])
    return splited[splited.length - 1]
  }).join(';')

  return Promise.resolve(head.join(';') + '\n' + data);
}

export default function handler(req, res) {

  if (req.method === 'POST') {
    let data = req.body.xml;

    parseString(data, async (err, result) => {
      if (result) {
        let csv = await getValeusToCsv(result);
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
