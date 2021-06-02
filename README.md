# maven-batch-upload


批量上传 maven 依赖到私服的小工具


## 背景

在一次做项目迁移的过程中，有大量的第三方jar包要上传到公司的私服，于是便写了个小工具进行批量上传

## 使用

### 安装依赖

```bash
npm install
```
### 修改配置

修改 config.js

```js
module.exports = {

    // 非必填, 默认 ~/.m2/repository"
    repoBasePath: "",
    // 必填参数，上传指定文件夹下的， 示例 /Users/xxx/.m2/repository/com/spring
    filePath: "/Users/xxx/.m2/repository/com/spring",
    // 指定上传的类型 pom , jar ，all  ,all 表示上传所有
    uploadPackaging : "jar",
    // 远程仓库id
    repositoryId: "nexus-releases",
    // 远程仓库地址
    repositoryUrl: "",
    // 非必填,远程snapshot仓库id, snapshot 包优先使用此仓库id
    snapshotRepositoryId: "nexus-snapshots",
    // 非必填,远程snapshot仓库地址, snapshot 包优先使用此地址
    snapshotRepositoryUrl: ""
}
```
### 上传

执行

```bash
node index.js
```

或者

```bash
npm run upload
```


