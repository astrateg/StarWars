﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using StarWars.Models;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using System.Globalization;
using StarWars.Models.ApiModels;

namespace IntegrationTests
{
  public class IntegrationTestRouter
  {
    public static Uri BaseUri { get; } = new Uri("http://local.star-wars.com/Home/");

    public static HttpClientHandler ClientHandler { get; } = new HttpClientHandler { UseCookies = false };
    public static LoggingHandler LoggingHandler { get; } = new LoggingHandler(ClientHandler);
    public static HttpClient Client { get; } = new HttpClient(LoggingHandler);

    public async Task<InitGameViewModel> InitGame(HttpStatusCode statusCode = HttpStatusCode.OK)
    {
      var uri = new Uri(BaseUri, "InitGame");

      var response = await Client.GetAsync(uri);
      Assert.AreEqual(statusCode, response.StatusCode);

      var stringResult = response.Content.ReadAsStringAsync().Result;
      var result = JsonConvert.DeserializeObject<InitGameViewModel>(stringResult);

      return result;
    }

    public async Task<GetShipsViewModel> GetShips(HttpStatusCode statusCode = HttpStatusCode.OK)
    {
      var uri = new Uri(BaseUri, "GetShips");

      var response = await Client.GetAsync(uri);
      Assert.AreEqual(statusCode, response.StatusCode);

      var stringResult = response.Content.ReadAsStringAsync().Result;
      var result = JsonConvert.DeserializeObject<GetShipsViewModel>(stringResult);

      return result;
    }

    public async Task<Ship> CreateRangerShip(Guid id, string name, int index, HttpStatusCode statusCode = HttpStatusCode.OK)
    {
      var uri = new Uri(BaseUri, "CreateRangerShip");

      var builder = new UriBuilder(uri);
      var query = HttpUtility.ParseQueryString(builder.Query);
      query["id"] = id.ToString();
      query["name"] = name;
      query["index"] = index.ToString(CultureInfo.InvariantCulture);
      builder.Query = query.ToString();

      var response = await Client.PostAsync(builder.Uri, null);
      Assert.AreEqual(statusCode, response.StatusCode);

      var stringResult = response.Content.ReadAsStringAsync().Result;
      var result = JsonConvert.DeserializeObject<Ship>(stringResult);

      return result;
    }

    public async Task DeleteRangerShip(Guid id, HttpStatusCode statusCode = HttpStatusCode.OK)
    {
      var message = new HttpRequestMessage
      {
        Method = HttpMethod.Post,
        RequestUri = new Uri(BaseUri, "DeactivateUserShip"),
      };

      message.Headers.Add("Cookie", $"Ship={ id.ToString() }");

      var result = await Client.SendAsync(message);
      result.EnsureSuccessStatusCode();
    }
  }
}
