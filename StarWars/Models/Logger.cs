using System;
using System.IO;

namespace StarWars.Models
{
  public static class Logger
  {
    public static void WriteToLogFile(DateTime dateBegin, DateTime dateEnd)
    {
      //string location = Environment.GetFolderPath(Environment.SpecialFolder.ApplicationData) + @"\Log\";
      string location = "D:\\";
      try
      {
        //Opens a new file stream which allows asynchronous reading and writing
        using (StreamWriter sw = new StreamWriter(new FileStream(location + @"log.txt", FileMode.Append, FileAccess.Write, FileShare.ReadWrite)))
        {
          //Writes the operation time (start/end)
          sw.WriteLine(String.Format("Start: {0}.{1}  End: {2}.{3} | {4}",
              dateBegin.ToLongTimeString(), dateBegin.Millisecond, dateEnd.ToLongTimeString(), dateEnd.Millisecond, dateEnd.Millisecond - dateBegin.Millisecond));
        }
      }
      catch (IOException)
      {
        if (!File.Exists(location + @"log.txt"))
        {
          File.Create(location + @"log.txt");
        }
      }
    }
  }
}