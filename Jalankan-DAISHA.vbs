Set WshShell = CreateObject("WScript.Shell")
strPath = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = strPath

' Jalankan node script app-launcher.cjs tanpa membuka jendela CMD (0 = Hidden window)
WshShell.Run "cmd /c node scripts/app-launcher.cjs", 0, False
