# Configuração

A chave `ConnectionStrings:SuperLiga` em appsettings.json define o banco. O padrão aponta para localhost, banco SuperLigaDB, com autenticação integrada do Windows.

Para substituir a conexão na sessão atual do PowerShell:

```powershell
$env:ConnectionStrings__SuperLiga = 'Server=localhost;Database=SuperLigaDB;Trusted_Connection=True;Encrypt=False;TrustServerCertificate=True;MultipleActiveResultSets=True'
dotnet run --launch-profile http
```

As opções de certificado acima correspondem ao desenvolvimento local. Para outro servidor, use a conexão e os certificados apropriados ao ambiente. Não adicione senhas reais ao repositório.

Properties/launchSettings.json define os perfis http (5233) e https (7023 e 5233), ambos em Development. Os níveis de log estão em appsettings.json e appsettings.Development.json.
