var builder = WebApplication.CreateBuilder(args);

// allow this app to be hosted on quizzardofozapi20240129091445.azurewebsites.net


// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// allow origin *
app.UseCors(builder => builder
    .AllowAnyOrigin()
       .AllowAnyMethod()
          .AllowAnyHeader());

app.MapControllers();

app.Run();
