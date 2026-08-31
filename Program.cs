using Microsoft.EntityFrameworkCore;
using SuperLiga.Api.Data;
using SuperLiga.Api.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddControllers();
builder.Services.AddDbContext<SuperLigaDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("SuperLiga")));
builder.Services.AddScoped<PartidaService>();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var database = scope.ServiceProvider.GetRequiredService<SuperLigaDbContext>();
    database.Database.Migrate();
}

// Configure the HTTP request pipeline.

app.UseDefaultFiles();
app.UseStaticFiles();
app.UseHttpsRedirection();
app.MapControllers();
app.MapFallbackToFile("index.html");

app.Run();
