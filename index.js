var shell = require('shelljs');
var path = require('path');
var fs = require("fs");
var os = require("os");
var config = require('./config');

// 仓库路径
repoBasePath = config.repoBasePath
if(!repoBasePath){
    repoBasePath = path.join(os.homedir(), ".m2/repository")
}
// 上传指定文件夹下的
let filePath = config.filePath
if(!filePath){
    console.error('filePath 不能为空');
    return
}

// 仓库地址，获取groupId时要去除掉
let workPath = path.join(os.homedir(), "maven-temp")
let uploadPackaging = config.uploadPackaging

if (!fs.existsSync(workPath)) {
    fs.mkdirSync(workPath)
}

fileDisplay(filePath)
let uploadList = []
function fileDisplay(filePath) {
    fs.readdir(filePath, function (err, files) {
        if (err) {
            console.error(err);
            return console.error(err);
        }
        // filename 示例 ehr-0.0.1-SNAPSHOT.jar
        files.forEach(function (filename) {
            // 全路径
            var filedir = path.join(filePath, filename);
            //根据文件路径获取文件信息，返回一个fs.Stats对象
            fs.stat(filedir, function (eror, stats) {
                if (eror) {
                    console.error('获取文件stats失败');
                } else {
                    if (stats.isDirectory()) {
                        fileDisplay(filedir);
                    }
                    if (stats.isFile()) {
                        if (!(filename.endsWith('.jar') || filename.endsWith('.pom'))) {
                            return
                        }
                        if (!(uploadPackaging == 'all' || filename.endsWith(uploadPackaging))) {
                            return
                        }
                        // 排除 SNAPSHOT 包干扰项
                        if (filedir.includes('SNAPSHOT') && !filename.includes('SNAPSHOT')) {
                            return
                        }
                        let pathArraystrs = filedir.split("/");
                        // jar 包完整名称
                        let jarFn = pathArraystrs.pop()
                        let version = pathArraystrs.pop()
                        let artifactId = pathArraystrs.pop()
                        let groupId = pathArraystrs.join('.').substring(repoBasePath.length + 1)
                        let currentWorkPath = workPath + '/' + artifactId + '-' + version
                        if (!fs.existsSync(currentWorkPath)) {
                            fs.mkdirSync(currentWorkPath)
                        }
                        let currentFilePath = `${currentWorkPath}/${filename}`
                        if (shell.exec(`cp ${filedir} ${currentFilePath}`).code !== 0) {
                            console.error("cp error " + currentFilePath);
                        } else {
                            console.log("复制文件到 " + currentFilePath);
                        }
                        let gav = {
                            groupId,
                            artifactId,
                            version,
                            file: currentFilePath
                        }

                        if (filename.endsWith('.jar')) {
                            var prefix = filedir.substring(0, filedir.length - 4)
                            var pomFileNameDir = prefix + ".pom"
                            if (fs.existsSync(pomFileNameDir)) {
                                var pomXmlFileNameDir = currentFilePath.replace(filename, "pom.xml")
                                if (!fs.existsSync(pomXmlFileNameDir)) {
                                    if (shell.exec(`cp ${pomFileNameDir} ${pomXmlFileNameDir}`).code !== 0) {
                                        console.error("cp error " + pomFileNameDir);
                                    } else {
                                        console.log("生成 " + pomXmlFileNameDir);
                                    }
                                }
                                gav.packaging = 'jar'
                                gav.pomFile = pomXmlFileNameDir

                                if ((gav.artifactId + '-' + gav.version + '.jar') != jarFn) {
                                    console.error("gav 不规范：" + gav);
                                } else {
                                    uploadList.push(gav)
                                }
                            } else {
                                console.error("pom 不存在：" + pomFileNameDir);
                            }
                        } else {
                            const str = fs.readFileSync(filedir, 'utf-8');
                            if (str.includes('<packaging>pom</packaging>')) {
                                gav.packaging = 'pom'
                                uploadList.push(gav)
                            }
                        }
                    }

                }
            })
        });
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
}
async function execute() {
    console.error('sleep start');
    await sleep(3000)
    console.error('sleep end');
    console.error('需要上传的数量: ' + uploadList.length);
    let errorGav = []
    uploadList.forEach(gav => {
        if (!(uploadPackaging == 'all' || uploadPackaging == gav.packaging)) {
            return
        }
        let pomFileShell = ''
        if (gav.packaging == 'jar') {
            pomFileShell = `-DpomFile=${gav.pomFile}`
        }
        let currentRepositoryId = config.repositoryId
        let currentRepositoryUrl = config.repositoryUrl
        if (gav.version.includes('SNAPSHOT') && config.snapshotRepositoryId && config.snapshotRepositoryUrl) {
            currentRepositoryId = config.snapshotRepositoryId
            currentRepositoryUrl = config.snapshotRepositoryUrl
        }
        let mavenshell = `mvn deploy:deploy-file -Dmaven.test.skip=true   -DgroupId=${gav.groupId}   -DartifactId=${gav.artifactId}  -Dversion=${gav.version} -Dpackaging=${gav.packaging}    -Dfile=${gav.file}  ${pomFileShell}  -DrepositoryId=${currentRepositoryId} -Durl=${currentRepositoryUrl}`
        console.log(`start maven upload, packaging=${gav.packaging},groupId=${gav.groupId},${gav.artifactId}-${gav.version}`);
        // console.log(mavenshell);
        // if (shell.exec(mavenshell).code !== 0) {
        //     errorGav.push(`groupId=${gav.groupId},${gav.artifactId}-${gav.version}`)
        // } else {
        //     console.log(`maven upload success, packaging=${gav.packaging},groupId=${gav.groupId},${gav.artifactId}-${gav.version}`);
        // }
    })
    console.log(`上传成功数量: ${uploadList.length - errorGav.length} , 失败数量: ${errorGav.length}`);
    if(errorGav.length > 0){
        console.log(`error gav: ${errorGav}`);
    }

}

execute()
