const fs = require('fs');
const argvs = process.argv.slice(2);
const settingVO = JSON.parse(argvs[0]);
console.log(settingVO)
let workspace = argvs[1];
if (!workspace) workspace = '.'
const configPath = `${workspace}/src/config.json`
const indexHtmlPath = `${workspace}/index.html`

function handleConfig() {
  // 读取文件
  const jsonString = fs.readFileSync(configPath, 'utf-8').toString()
  const jsonData = JSON.parse(jsonString)
  Object.keys(jsonData).forEach(key => {
  	console.log(jsonData[key], settingVO[key])
    if (settingVO[key]) jsonData[key] = settingVO[key]
  })
  // 将修改后的JSON内容写回到文件中
  fs.writeFileSync(configPath, JSON.stringify(jsonData, null, 2));

}

function handleHtml() {
  // 读取文件
  const indexHtmlData = fs.readFileSync(indexHtmlPath, 'utf-8')
  const name = settingVO.name || '';
  const updatedContent = indexHtmlData.replace(/<title>(.*?)<\/title>/g, `<title>${name}后台管理系统</title>`)
  // 将修改后的JSON内容写回到文件中
  fs.writeFileSync(indexHtmlPath, updatedContent);
}
handleHtml()
handleConfig()