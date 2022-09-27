const { existsSync, readFileSync } = require('fs')
const { join } = require('path')

const { platform, arch } = process

let nativeBinding = null
let localFileExisted = false
let loadError = null

function isMusl() {
  // For Node 10
  if (!process.report || typeof process.report.getReport !== 'function') {
    try {
      return readFileSync('/usr/bin/ldd', 'utf8').includes('musl')
    } catch (e) {
      return true
    }
  } else {
    const { glibcVersionRuntime } = process.report.getReport().header
    return !glibcVersionRuntime
  }
}

switch (platform) {
  case 'android':
    switch (arch) {
      case 'arm64':
        localFileExisted = existsSync(join(__dirname, 'rust.android-arm64.node'))
        try {
          if (localFileExisted) {
            nativeBinding = require('./rust.android-arm64.node')
          } else {
            nativeBinding = require('@user.tax/rust-android-arm64')
          }
        } catch (e) {
          loadError = e
        }
        break
      case 'arm':
        localFileExisted = existsSync(join(__dirname, 'rust.android-arm-eabi.node'))
        try {
          if (localFileExisted) {
            nativeBinding = require('./rust.android-arm-eabi.node')
          } else {
            nativeBinding = require('@user.tax/rust-android-arm-eabi')
          }
        } catch (e) {
          loadError = e
        }
        break
      default:
        throw new Error(`Unsupported architecture on Android ${arch}`)
    }
    break
  case 'win32':
    switch (arch) {
      case 'x64':
        localFileExisted = existsSync(
          join(__dirname, 'rust.win32-x64-msvc.node')
        )
        try {
          if (localFileExisted) {
            nativeBinding = require('./rust.win32-x64-msvc.node')
          } else {
            nativeBinding = require('@user.tax/rust-win32-x64-msvc')
          }
        } catch (e) {
          loadError = e
        }
        break
      case 'ia32':
        localFileExisted = existsSync(
          join(__dirname, 'rust.win32-ia32-msvc.node')
        )
        try {
          if (localFileExisted) {
            nativeBinding = require('./rust.win32-ia32-msvc.node')
          } else {
            nativeBinding = require('@user.tax/rust-win32-ia32-msvc')
          }
        } catch (e) {
          loadError = e
        }
        break
      case 'arm64':
        localFileExisted = existsSync(
          join(__dirname, 'rust.win32-arm64-msvc.node')
        )
        try {
          if (localFileExisted) {
            nativeBinding = require('./rust.win32-arm64-msvc.node')
          } else {
            nativeBinding = require('@user.tax/rust-win32-arm64-msvc')
          }
        } catch (e) {
          loadError = e
        }
        break
      default:
        throw new Error(`Unsupported architecture on Windows: ${arch}`)
    }
    break
  case 'darwin':
    switch (arch) {
      case 'x64':
        localFileExisted = existsSync(join(__dirname, 'rust.darwin-x64.node'))
        try {
          if (localFileExisted) {
            nativeBinding = require('./rust.darwin-x64.node')
          } else {
            nativeBinding = require('@user.tax/rust-darwin-x64')
          }
        } catch (e) {
          loadError = e
        }
        break
      case 'arm64':
        localFileExisted = existsSync(
          join(__dirname, 'rust.darwin-arm64.node')
        )
        try {
          if (localFileExisted) {
            nativeBinding = require('./rust.darwin-arm64.node')
          } else {
            nativeBinding = require('@user.tax/rust-darwin-arm64')
          }
        } catch (e) {
          loadError = e
        }
        break
      default:
        throw new Error(`Unsupported architecture on macOS: ${arch}`)
    }
    break
  case 'freebsd':
    if (arch !== 'x64') {
      throw new Error(`Unsupported architecture on FreeBSD: ${arch}`)
    }
    localFileExisted = existsSync(join(__dirname, 'rust.freebsd-x64.node'))
    try {
      if (localFileExisted) {
        nativeBinding = require('./rust.freebsd-x64.node')
      } else {
        nativeBinding = require('@user.tax/rust-freebsd-x64')
      }
    } catch (e) {
      loadError = e
    }
    break
  case 'linux':
    switch (arch) {
      case 'x64':
        if (isMusl()) {
          localFileExisted = existsSync(
            join(__dirname, 'rust.linux-x64-musl.node')
          )
          try {
            if (localFileExisted) {
              nativeBinding = require('./rust.linux-x64-musl.node')
            } else {
              nativeBinding = require('@user.tax/rust-linux-x64-musl')
            }
          } catch (e) {
            loadError = e
          }
        } else {
          localFileExisted = existsSync(
            join(__dirname, 'rust.linux-x64-gnu.node')
          )
          try {
            if (localFileExisted) {
              nativeBinding = require('./rust.linux-x64-gnu.node')
            } else {
              nativeBinding = require('@user.tax/rust-linux-x64-gnu')
            }
          } catch (e) {
            loadError = e
          }
        }
        break
      case 'arm64':
        if (isMusl()) {
          localFileExisted = existsSync(
            join(__dirname, 'rust.linux-arm64-musl.node')
          )
          try {
            if (localFileExisted) {
              nativeBinding = require('./rust.linux-arm64-musl.node')
            } else {
              nativeBinding = require('@user.tax/rust-linux-arm64-musl')
            }
          } catch (e) {
            loadError = e
          }
        } else {
          localFileExisted = existsSync(
            join(__dirname, 'rust.linux-arm64-gnu.node')
          )
          try {
            if (localFileExisted) {
              nativeBinding = require('./rust.linux-arm64-gnu.node')
            } else {
              nativeBinding = require('@user.tax/rust-linux-arm64-gnu')
            }
          } catch (e) {
            loadError = e
          }
        }
        break
      case 'arm':
        localFileExisted = existsSync(
          join(__dirname, 'rust.linux-arm-gnueabihf.node')
        )
        try {
          if (localFileExisted) {
            nativeBinding = require('./rust.linux-arm-gnueabihf.node')
          } else {
            nativeBinding = require('@user.tax/rust-linux-arm-gnueabihf')
          }
        } catch (e) {
          loadError = e
        }
        break
      default:
        throw new Error(`Unsupported architecture on Linux: ${arch}`)
    }
    break
  default:
    throw new Error(`Unsupported OS: ${platform}, architecture: ${arch}`)
}

if (!nativeBinding) {
  if (loadError) {
    throw loadError
  }
  throw new Error(`Failed to load native binding`)
}

const { z85Dump, z85Load, ipBin, binU64, u64Bin, zipU64, unzipU64, b64, unb64, blake3Round, blake3, xxh3, encrypt, decrypt, randomBytes } = nativeBinding

module.exports.z85Dump = z85Dump
module.exports.z85Load = z85Load
module.exports.ipBin = ipBin
module.exports.binU64 = binU64
module.exports.u64Bin = u64Bin
module.exports.zipU64 = zipU64
module.exports.unzipU64 = unzipU64
module.exports.b64 = b64
module.exports.unb64 = unb64
module.exports.blake3Round = blake3Round
module.exports.blake3 = blake3
module.exports.xxh3 = xxh3
module.exports.encrypt = encrypt
module.exports.decrypt = decrypt
module.exports.randomBytes = randomBytes