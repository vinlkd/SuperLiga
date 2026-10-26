# Instalação local

## Requisitos

- SDK .NET 10.
- SQL Server acessível e uma conta autorizada a criar/atualizar o banco.
- Navegador atualizado com JavaScript habilitado.

## Executar

```powershell
git clone https://github.com/vinlkd/SuperLiga.git
cd SuperLiga
dotnet restore
dotnet build --no-restore
dotnet run --launch-profile http
```

Abra http://localhost:5233. A aplicação executa as migrations antes de servir as páginas; não é necessário cadastrar tabelas manualmente. O banco deve estar disponível antes da execução.

Para o perfil HTTPS, configure o certificado de desenvolvimento com `dotnet dev-certs https --trust` e use `dotnet run --launch-profile https`. A URL é https://localhost:7023.

Encerre a aplicação com Ctrl+C antes de recompilar se o Windows indicar que o executável está em uso.
