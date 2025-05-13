import fs from 'fs'

export default class ToFile {
  constructor({filepath, annotate}) {
    this.filepath = filepath
    this.annotate = annotate
    fs.writeFileSync(filepath, `${annotate.join(' ')}\n`)
  }

  async fn({data}) {
    const line = this.annotate
      .map(label => data[label])
      .join(' ')
    fs.writeFileSync(this.filepath, `${line}\n`, { flag: 'a' })
  }
}