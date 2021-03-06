﻿using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Serialization;
using StarWars.Web.Models;

namespace StarWars.Web
{
  public class Startup
  {
    public GameNotifier GameNotifier { get; private set; }

    public Startup(IConfiguration configuration)
    {
      Configuration = configuration;
    }

    public IConfiguration Configuration { get; }

    // This method gets called by the runtime. Use this method to add services to the container.
    public void ConfigureServices(IServiceCollection services)
    {
      services.Configure<CookiePolicyOptions>(options =>
      {
        // This lambda determines whether user consent for non-essential cookies is needed for a given request.
        options.CheckConsentNeeded = context => true;
        options.MinimumSameSitePolicy = SameSiteMode.None;
      });

      services
        .AddMvc()
        .AddJsonOptions(options => options.SerializerSettings.ContractResolver = new DefaultContractResolver())
        .SetCompatibilityVersion(CompatibilityVersion.Version_2_1);

      services
        .AddSignalR(options =>
        {
          options.EnableDetailedErrors = true;
        })
        .AddJsonProtocol(options =>
        {
          options.PayloadSerializerSettings.ContractResolver = new DefaultContractResolver();
        });

      services.AddTransient<GameNotifier>();
      services.AddSingleton(Configuration.GetSection("GameConfiguration").Get<GameConfiguration>());
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IHostingEnvironment env, IApplicationLifetime appLifetime)
    {
      if (env.IsDevelopment())
      {
        app.UseDeveloperExceptionPage();
      }
      else
      {
        app.UseExceptionHandler("/Home/Error");
        app.UseHsts();
      }

      app.UseHttpsRedirection();
      app.UseStaticFiles();
      //app.UseCookiePolicy();

      app.UseSignalR(routes =>
      {
        routes.MapHub<SpaceHub>("/spaceHub");
      });

      app.UseMvc(routes =>
      {
        routes.MapRoute(
                  name: "default",
                  template: "{controller=Home}/{action=Index}/{id?}");
      });

      appLifetime.ApplicationStarted.Register(() =>
      {
        GameNotifier = app.ApplicationServices.GetService<GameNotifier>();
        GameNotifier.UpdateGameState(null);
      });
    }
  }
}
