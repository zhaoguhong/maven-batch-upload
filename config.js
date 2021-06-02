module.exports = {

    // 非必填, 默认 ~/.m2/repository"
    repoBasePath: "",
    // 必填参数，上传指定文件夹下的， 示例 /Users/xxx/.m2/repository/com/spring
    filePath: "/Users/zhaojianhe/.m2/repository/com/geelytech",
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