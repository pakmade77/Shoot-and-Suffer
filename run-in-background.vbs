Set fso = CreateObject("Scripting.FileSystemObject")
Set WshShell = CreateObject("WScript.Shell")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
WshShell.CurrentDirectory = scriptDir
WshShell.Run chr(34) & scriptDir & "\start-server.bat" & chr(34), 0
Set WshShell = Nothing
Set fso = Nothing
