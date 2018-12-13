// import ServiceCDE from "spinal-env-viewer-plugin-documentation-service";
// import bimObjectService from 'spinal-env-viewer-plugin-bimobjectservice';
import {
  SPINAL_RELATION_PTR_LST_TYPE,
} from 'spinal-model-graph';
class FileSystemExplorer {
  constructor() {
    this.spinalSystem = window.spinal.spinalSystem;
    this.pathForgeFile = this.spinalSystem.getPath();
  }

  getDrivePathRoot() {
    var user = this.spinalSystem.getUser();
    var home = "/__users__/" + user.username;
    this.currentPath = home;
    var route = {};
    route.name = "home";
    route.path = home;
    return route;
  }
  createDriveRoute(path, file) {
    var name = "/ " + file.name;
    var mypath = path + "/" + file.name;
    var route = {};
    route.name = name;
    route.path = mypath;
    return route
  }
  loadDrivePath(currentPath) {
    let tabDisplay = [];
    return this.spinalSystem.load(currentPath).then(directory => {
      for (let i = 0; i < directory.length; i++) {
        const element = directory[i];
        let obj = {
          name: element.name.get(),
          type: element._info.model_type.get(),
          serverid: element._server_id,
          path: currentPath + "/" + element.name.get()
        }
        tabDisplay.push(obj);
      }
      return tabDisplay;
    });

  }
  async getDirectory(selectedNode) {
    // console.log("getDirectory")
    if (selectedNode != undefined) {
      const fileNode = await selectedNode.getChildren("hasFiles");
      if (fileNode.length == 0) {
        return []
      } else {
        let directory = await fileNode[0].getElement();
        return (directory)
      }
    }
  }
  async getNbChildren(selectedNode) {
    const fileNode = await selectedNode.getChildren("hasFiles");
    return fileNode.length
  }
  async createDirectory(selectedNode) {
    // console.log("createDirectory")
    let nbNode = await this.getNbChildren(selectedNode);
    if (nbNode == 0) {
      let myDirectory = new Directory();
      selectedNode.addChild(
        myDirectory,
        'hasFiles',
        SPINAL_RELATION_PTR_LST_TYPE
      );
      return myDirectory;
    } else {
      return this.getDirectory(selectedNode)
    }
  }
  addFileUpload(directory, uploadFileList) {
    for (let i = 0; i < uploadFileList.length; i++) {
      const element = uploadFileList[i];
      let filePath = new Path(element);
      let myFile = new File(element.name, filePath);
      directory.push(myFile);
    }
  }
  addFileDrive(directory, driveFileList) {
    for (let i = 0; i < driveFileList.length; i++) {
      const driveFile = driveFileList[i];
      let test = this.checkInfinitInclusion(FileSystem._objects[driveFile.serverid]);
      test.then((res) => {
        if (res == false) {
          return false
        } else {
          directory.push(FileSystem._objects[driveFile.serverid])
          return true
        }
      })
    }
  }
  getDigitalTwithePath() {
    return this.spinalSystem.getPath()
  }
  pathParse(path) {
    let arrayOfPath = path.split("/");
    let nameFile = arrayOfPath[arrayOfPath.length - 1]
    return nameFile
  }
  callback(file) {
    return new Promise(resolve => {
      file._ptr.load(resolve);
    })
  }
  checkInfinitInclusion(file) {
    let DigitalTwinPath = this.spinalSystem.getPath();
    let nameFile = this.pathParse(DigitalTwinPath);
    let _this = this;
    let tab = [];
    if (file.name.get() == nameFile) {
      return Promise.resolve(false)
    } else if (file._info.model_type.get() === "Directory") {
      return this.callback(file).then((resdir) => {
        if (resdir.length > 0) {
          for (let i = 0; i < resdir.length; i++) {
            const file = resdir[i];
            tab.push(_this.checkInfinitInclusion(file))
          }
          return Promise.all(tab).then((array) => {
            return !array.includes(false);
          })
        } else {
          return true;
        }
      })
    } else {
      return Promise.resolve(true);
    }
  }
  addDirectory(selectedNode) {
    console.log(selectedNode)
  }
  getIconFile(file) {
    let fileType;
    if (file.type != undefined) {
      fileType = file.type;
    } else {
      fileType = file._info.model_type.get();
    }
    if (fileType === "Directory") return "folder";
    else if (fileType === "Digital twin") return "location_city";
    else if (fileType === "Path") return "insert_drive_file";
    else return "not_listed_location";
  }

}
export const FileExplorer = new FileSystemExplorer()