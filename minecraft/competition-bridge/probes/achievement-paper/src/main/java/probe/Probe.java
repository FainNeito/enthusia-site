package probe;
import org.bukkit.Bukkit;
import org.bukkit.plugin.Plugin;
import org.bukkit.plugin.java.JavaPlugin;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicBoolean;
public final class Probe extends JavaPlugin {
  @Override public void onEnable() {
    Plugin bridge=Bukkit.getPluginManager().getPlugin("EnthusiaCompetitionBridge");
    Plugin provider=Bukkit.getPluginManager().getPlugin("EnthusiaAdvancements");
    provider.getConfig().set("website.public-player-completions",true);
    Bukkit.getScheduler().runTask(this, () -> {
      try {
        var method=provider.getClass().getMethod("websitePlayerAchievements",List.class);
        var row=(Map<?,?>)method.invoke(provider,List.of(UUID.fromString("00000000-0000-4000-8000-000000000001")));
        if(!List.of().equals(row.get("items"))) throw new IllegalStateException("offline player must be unknown");
        getLogger().info("PROBE provider offline exclusion PASS");
      } catch(Exception e){getLogger().severe("PROBE FAIL provider "+e);}
      Bukkit.getScheduler().runTaskAsynchronously(this, () -> {
        try {
          var type=Class.forName("network.enthusia.competitions.bridge.PublicCommunitySources",true,bridge.getClass().getClassLoader());
          var ctor=type.getDeclaredConstructor(Plugin.class);ctor.setAccessible(true);Object source=ctor.newInstance(bridge);
          var method=type.getDeclaredMethod("readPlayers",List.class);method.setAccessible(true);
          var result=(Map<?,?>)method.invoke(source,List.of(UUID.fromString("00000000-0000-4000-8000-000000000001")));
          if(!List.of().equals(result.get("items")))throw new IllegalStateException("bridge invented player");
          getLogger().info("PROBE bridge real provider PASS");
          var taskClass=Class.forName("network.enthusia.competitions.bridge.MainThreadBridge",true,bridge.getClass().getClassLoader());
          var call=taskClass.getDeclaredMethod("callCancellableRead",Plugin.class,int.class,Callable.class);call.setAccessible(true);
          AtomicBoolean ran=new AtomicBoolean();CountDownLatch blocked=new CountDownLatch(1);
          Bukkit.getScheduler().runTask(this,()->{blocked.countDown();try{Thread.sleep(250);}catch(InterruptedException e){Thread.currentThread().interrupt();}});
          if(!blocked.await(2,TimeUnit.SECONDS))throw new IllegalStateException("main thread not blocked");
          try{call.invoke(null,bridge,25,(Callable<Object>)()->{ran.set(true);return null;});throw new IllegalStateException("timeout did not occur");}
          catch(java.lang.reflect.InvocationTargetException e){if(!(e.getCause() instanceof TimeoutException))throw e;}
          Bukkit.getScheduler().runTaskLater(this,()->{if(ran.get())getLogger().severe("PROBE FAIL timeout task ran");else getLogger().info("PROBE scheduler timeout cancellation PASS");},10);
        } catch(Exception e){getLogger().severe("PROBE FAIL bridge "+e);}
      });
    });
  }
}
