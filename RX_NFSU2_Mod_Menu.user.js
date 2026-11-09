// ==UserScript==
// @name         RX Mod Menu - NFS Underground 2 Revived
// @namespace    https://rx-nfsu2-mod-menu.local/
// @version      1.0.9
// @description  RX NFSU2 v1.0.8: streamlined interface, preserved features, mobile tap fixes and save protection.
// @match        https://nfsu2.xyz/*
// @match        https://www.nfsu2.xyz/*
// @run-at       document-start
// @grant        none
// ==/UserScript==
/* RX fan-made userscript. Local OPFS edits and an optional in-game memory flag.
   No server/network calls. Third-party source notices are documented in NOTICE.md.
   Not affiliated with EA or the NFSU2 Revived project. */
/* RX V1.0.0: Early, page-local WebAssembly memory capture for the native
   showAllHiddenShops byte (North American SPEED2.EXE 1.2: address 0x838441).
   No worker hooks, no network requests, and no permanent save writes. */
const rx_LIVE_SHOPS = (() => {
  const entry = { memory:null, hooked:false, error:'', captures:0, address:0x838441 };
  try {
    if (typeof WebAssembly !== 'undefined' && WebAssembly.Memory) {
      const NativeMemory = WebAssembly.Memory;
      let proxy;
      proxy = new Proxy(NativeMemory, {
        construct(target, args, newTarget) {
          const memory = Reflect.construct(target, args, newTarget===proxy ? target : newTarget);
          const settings = args && args[0];
          if (settings && settings.shared === true && memory.buffer.byteLength > entry.address) {
            entry.memory=memory; entry.captures++;
          }
          return memory;
        }
      });
      WebAssembly.Memory = proxy;
      entry.hooked = WebAssembly.Memory === proxy;
      if (!entry.hooked) entry.error='Memory constructor is read-only';
    } else entry.error='WebAssembly.Memory is unavailable';
  } catch (error) { entry.error=String(error); }
  return entry;
})();

function rx_BOOT_MENU() {
  if (!document.body || !document.querySelector('#stage')) return false;
  rx_START_MENU();
  return true;
}
function rx_WAIT_FOR_STAGE() {
  if (rx_BOOT_MENU()) return;
  const observer=new MutationObserver(() => { if (rx_BOOT_MENU()) observer.disconnect(); });
  observer.observe(document.documentElement, {subtree:true,childList:true});
  setTimeout(() => observer.disconnect(), 20000);
}
if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', rx_WAIT_FOR_STAGE,{once:true});
else rx_WAIT_FOR_STAGE();

function rx_START_MENU() {
  'use strict';
  if (!document.querySelector('#stage')) return;

  if (window.__rx_NFSU2_MOD_MENU__) return;
  Object.defineProperty(window,'__rx_NFSU2_MOD_MENU__',{value:true,configurable:false});
  const STRINGS = {"en":{"checking":"Checking game…","profile":"Career profile","language":"Language","auto":"Auto (browser)","money":"Money","garage":"Garage","tuning":"Tuning","safety":"Safety","balance":"CURRENT BALANCE","setCash":"Set career cash","applyMoney":"Apply Money","yourGarage":"YOUR GARAGE","unlockDesc":"Unlock all 5 garage slots. Cars you do not own require a separate unlock.","unlockGarage":"Unlock 5 Garage Slots","duplicateTitle":"DUPLICATE EXISTING CAR","duplicateDesc":"Copy one of your cars into an empty garage slot.","duplicate":"Duplicate Car","perfTitle":"PERFORMANCE UPGRADES","perfDesc":"Max out performance upgrades on cars already in your garage.","maxPerf":"Max Performance (All Cars)","saveTitle":"SAVE PROTECTION","saveDesc":"A local copy is made before each change, in a separate OPFS folder.","downloadBackup":"Download Profile Backup","restoreBackup":"Restore Last RX Backup","refresh":"Refresh Profiles","warning":"⚠️ Exit your game with F9 → Quit game before editing. For cloud saves, temporarily disable sync and check for conflicts before turning it back on. Do not edit files from another tab.","openTitle":"Open RX Mod Menu (F6)","closeTitle":"Close","noProfiles":"No profiles found","searching":"Searching for profiles…","playing":"⛔ Game running: exit the game before editing.","ready":"✓ Profile “{name}” ready to edit.","none":"No profile found. Create and save a career first.","locked":"Locked","car":"Car","free":"Free","slot":"Slot","moneyInvalid":"Invalid amount (0 to 2,147,483,647).","pageMissing":"Game page not found: edit cancelled.","exitFirst":"Exit the game with F9 → Quit game. Never edit saves while playing.","noStorage":"OPFS storage is unavailable in this browser.","fileMissing":"Profile file not found.","badFormat":"Incompatible or unrecognized save format.","nameMismatch":"Save name does not match its folder.","badChecksums":"Invalid checksums: edit cancelled for safety.","badBackup":"Invalid local backup.","writeFailed":"Saved data verification failed.","partialWrite":"Incomplete write detected.","selectProfile":"Select a profile.","badGeneratedChecksum":"Generated checksums are invalid.","noChange":"No changes to apply.","saved":"Changes saved. Restart the game to load them.","enterAmount":"Enter an amount.","chooseSlots":"Select a car and an empty slot.","confirmDuplicate":"Duplicate the car in slot {from} into slot {to}? Keep a backup before changing the garage.","invalidSlots":"Incompatible garage slots.","profileDownloaded":"Profile downloaded. Also keep a full game ZIP backup.","confirmRestore":"Restore the previous RX backup for {name}? Current progress will be replaced.","restored":"Previous backup restored. Restart the game."},"fr":{"checking":"Vérification du jeu…","profile":"Profil de carrière","language":"Langue","auto":"Auto (navigateur)","money":"Argent","garage":"Garage","tuning":"Améliorations","safety":"Sécurité","balance":"SOLDE ACTUEL","setCash":"Argent de la carrière","applyMoney":"Appliquer l’argent","yourGarage":"TON GARAGE","unlockDesc":"Débloque les 5 emplacements. Les voitures non possédées nécessitent un déblocage distinct.","unlockGarage":"Débloquer les 5 places","duplicateTitle":"DUPLIQUER UNE VOITURE","duplicateDesc":"Copie une voiture vers une place vide .","duplicate":"Dupliquer la voiture","perfTitle":"AMÉLIORATIONS DES PERFORMANCES","perfDesc":"Améliore au maximum les voitures déjà présentes dans ton garage.","maxPerf":"Performances max (toutes)","saveTitle":"PROTECTION DES SAUVEGARDES","saveDesc":"Une copie locale est créée avant chaque modification, dans un dossier OPFS séparé.","downloadBackup":"Télécharger une sauvegarde","restoreBackup":"Restaurer le dernier backup RX","refresh":"Actualiser les profils","warning":"⚠️ Quitte le jeu via F9 → Quit game avant de modifier. Pour les sauvegardes cloud, désactive temporairement la synchronisation et vérifie les conflits avant de la réactiver. Ne modifie pas les fichiers depuis un autre onglet.","openTitle":"Ouvrir RX Mod Menu (F6)","closeTitle":"Fermer","noProfiles":"Aucun profil trouvé","searching":"Recherche des profils…","playing":"⛔ Jeu en cours : quitte la partie pour modifier.","ready":"✓ Profil « {name} » prêt à modifier.","none":"Aucun profil détecté. Crée et sauvegarde une carrière.","locked":"Verrouillé","car":"Voiture","free":"Libre","slot":"Place","moneyInvalid":"Montant invalide (0 à 2 147 483 647).","pageMissing":"Page du jeu introuvable : modification refusée.","exitFirst":"Quitte le jeu via F9 → Quit game. Ne modifie pas une sauvegarde pendant une partie.","noStorage":"Stockage OPFS indisponible dans ce navigateur.","fileMissing":"Fichier du profil introuvable.","badFormat":"Format de sauvegarde incompatible ou non reconnu.","nameMismatch":"Le nom enregistré ne correspond pas au dossier.","badChecksums":"Checksums incorrects : modification refusée par précaution.","badBackup":"Backup local invalide.","writeFailed":"La vérification de la sauvegarde écrite a échoué.","partialWrite":"Écriture incomplète.","selectProfile":"Sélectionne un profil.","badGeneratedChecksum":"Erreur dans les checksums générés.","noChange":"Aucun changement à appliquer.","saved":"Modifications enregistrées. Relance le jeu pour les charger.","enterAmount":"Entre un montant.","chooseSlots":"Choisis une voiture et un emplacement vide.","confirmDuplicate":"Dupliquer le véhicule de la place {from} vers {to} ? Une sauvegarde est conseillée.","invalidSlots":"Emplacements incompatibles.","profileDownloaded":"Profil téléchargé. Conserve aussi un backup ZIP complet du jeu.","confirmRestore":"Restaurer la sauvegarde RX précédente pour {name} ? La progression actuelle sera remplacée.","restored":"Sauvegarde précédente restaurée. Relance le jeu."},"es":{"checking":"Comprobando el juego…","profile":"Perfil de carrera","language":"Idioma","auto":"Auto (navegador)","money":"Dinero","garage":"Garaje","tuning":"Mejoras","safety":"Seguridad","balance":"SALDO ACTUAL","setCash":"Dinero de carrera","applyMoney":"Aplicar dinero","yourGarage":"TU GARAJE","unlockDesc":"Desbloquea las 5 plazas del garaje. Los coches que no posees requieren otro desbloqueo.","unlockGarage":"Desbloquear 5 plazas","duplicateTitle":"DUPLICAR COCHE","duplicateDesc":"Copia uno de tus coches en una plaza vacía .","duplicate":"Duplicar coche","perfTitle":"MEJORAS DE RENDIMIENTO","perfDesc":"Mejora al máximo los coches que ya están en tu garaje.","maxPerf":"Rendimiento máximo (todos)","saveTitle":"PROTECCIÓN DE PARTIDAS","saveDesc":"Se crea una copia local antes de cada cambio, en una carpeta OPFS independiente.","downloadBackup":"Descargar copia del perfil","restoreBackup":"Restaurar última copia RX","refresh":"Actualizar perfiles","warning":"⚠️ Sal del juego con F9 → Quit game antes de editar. Para partidas en la nube, desactiva la sincronización y comprueba conflictos antes de reactivarla. No edites desde otra pestaña.","openTitle":"Abrir RX Mod Menu (F6)","closeTitle":"Cerrar","noProfiles":"No se encontraron perfiles","searching":"Buscando perfiles…","playing":"⛔ Juego en curso: sal antes de editar.","ready":"✓ Perfil «{name}» listo para editar.","none":"No hay perfiles. Crea y guarda una carrera.","locked":"Bloqueado","car":"Coche","free":"Libre","slot":"Plaza","moneyInvalid":"Cantidad inválida (0 a 2.147.483.647).","pageMissing":"Página del juego no encontrada: edición cancelada.","exitFirst":"Sal del juego con F9 → Quit game. No edites partidas mientras juegas.","noStorage":"Almacenamiento OPFS no disponible en este navegador.","fileMissing":"Archivo de perfil no encontrado.","badFormat":"Formato de guardado no reconocido.","nameMismatch":"El nombre del perfil no coincide con la carpeta.","badChecksums":"Sumas de verificación incorrectas: edición cancelada.","badBackup":"Copia local inválida.","writeFailed":"No se pudo verificar el archivo guardado.","partialWrite":"Escritura incompleta.","selectProfile":"Selecciona un perfil.","badGeneratedChecksum":"Error en las sumas de verificación.","noChange":"No hay cambios.","saved":"Cambios guardados. Reinicia el juego para cargarlos.","enterAmount":"Introduce una cantidad.","chooseSlots":"Selecciona un coche y una plaza vacía.","confirmDuplicate":"¿Duplicar el coche de la plaza {from} en la {to}? Haz una copia de seguridad antes del cambio.","invalidSlots":"Plazas incompatibles.","profileDownloaded":"Perfil descargado. Guarda también una copia ZIP completa del juego.","confirmRestore":"¿Restaurar la copia RX anterior de {name}? Se reemplazará el progreso actual.","restored":"Copia anterior restaurada. Reinicia el juego."},"pt":{"checking":"Verificando o jogo…","profile":"Perfil da carreira","language":"Idioma","auto":"Auto (navegador)","money":"Dinheiro","garage":"Garagem","tuning":"Melhorias","safety":"Segurança","balance":"SALDO ATUAL","setCash":"Dinheiro da carreira","applyMoney":"Aplicar dinheiro","yourGarage":"SUA GARAGEM","unlockDesc":"Desbloqueia as 5 vagas da garagem. Carros não adquiridos exigem outro desbloqueio.","unlockGarage":"Desbloquear 5 vagas","duplicateTitle":"DUPLICAR CARRO","duplicateDesc":"Copia um carro para uma vaga vazia .","duplicate":"Duplicar carro","perfTitle":"MELHORIAS DE DESEMPENHO","perfDesc":"Maximiza o desempenho dos carros já presentes na garagem.","maxPerf":"Desempenho máximo (todos)","saveTitle":"PROTEÇÃO DO SAVE","saveDesc":"Uma cópia local é criada antes de cada mudança numa pasta OPFS separada.","downloadBackup":"Baixar cópia do perfil","restoreBackup":"Restaurar último backup RX","refresh":"Atualizar perfis","warning":"⚠️ Saia do jogo com F9 → Quit game antes de editar. Para saves na nuvem, desative a sincronização e confira conflitos antes de reativar. Não edite em outra aba.","openTitle":"Abrir RX Mod Menu (F6)","closeTitle":"Fechar","noProfiles":"Nenhum perfil encontrado","searching":"Procurando perfis…","playing":"⛔ Jogo em execução: saia antes de editar.","ready":"✓ Perfil “{name}” pronto para editar.","none":"Nenhum perfil. Crie e salve uma carreira.","locked":"Bloqueado","car":"Carro","free":"Livre","slot":"Vaga","moneyInvalid":"Valor inválido (0 a 2.147.483.647).","pageMissing":"Página do jogo não encontrada: edição cancelada.","exitFirst":"Saia com F9 → Quit game. Não edite saves durante o jogo.","noStorage":"Armazenamento OPFS indisponível neste navegador.","fileMissing":"Arquivo do perfil não encontrado.","badFormat":"Formato de save incompatível.","nameMismatch":"O nome do save não corresponde à pasta.","badChecksums":"Verificações inválidas: edição cancelada por segurança.","badBackup":"Backup local inválido.","writeFailed":"Falha ao verificar o save gravado.","partialWrite":"Gravação incompleta.","selectProfile":"Selecione um perfil.","badGeneratedChecksum":"Verificações geradas inválidas.","noChange":"Nenhuma alteração a aplicar.","saved":"Alterações salvas. Reinicie o jogo para carregá-las.","enterAmount":"Digite um valor.","chooseSlots":"Selecione um carro e uma vaga vazia.","confirmDuplicate":"Duplicar o carro da vaga {from} para {to}? Faça um backup antes da alteração.","invalidSlots":"Vagas incompatíveis.","profileDownloaded":"Perfil baixado. Guarde também um backup ZIP completo do jogo.","confirmRestore":"Restaurar o backup RX anterior de {name}? O progresso atual será substituído.","restored":"Backup anterior restaurado. Reinicie o jogo."},"de":{"checking":"Spiel wird überprüft…","profile":"Karriereprofil","language":"Sprache","auto":"Auto (Browser)","money":"Geld","garage":"Garage","tuning":"Tuning","safety":"Sicherheit","balance":"AKTUELLER KONTOSTAND","setCash":"Karriere-Geld einstellen","applyMoney":"Geld übernehmen","yourGarage":"DEINE GARAGE","unlockDesc":"Schaltet alle 5 Garagenplätze frei. Nicht vorhandene Autos müssen separat freigeschaltet werden.","unlockGarage":"5 Garagenplätze freischalten","duplicateTitle":"AUTO DUPLIZIEREN","duplicateDesc":"Kopiere eines deiner Autos auf einen freien Platz (experimentell).","duplicate":"Auto duplizieren","perfTitle":"LEISTUNGS-UPGRADES","perfDesc":"Maximiert die Leistung der Autos in deiner Garage.","maxPerf":"Max. Leistung (alle Autos)","saveTitle":"SPIELSTAND-SCHUTZ","saveDesc":"Vor jeder Änderung wird eine lokale Kopie in einem separaten OPFS-Ordner erstellt.","downloadBackup":"Profil-Backup herunterladen","restoreBackup":"Letztes RX-Backup laden","refresh":"Profile aktualisieren","warning":"⚠️ Beende das Spiel vor dem Bearbeiten über F9 → Quit game. Deaktiviere bei Cloud-Saves vorübergehend die Synchronisierung und prüfe Konflikte. Nicht in einem anderen Tab bearbeiten.","openTitle":"RX Mod Menu öffnen (F6)","closeTitle":"Schließen","noProfiles":"Keine Profile gefunden","searching":"Profile werden gesucht…","playing":"⛔ Spiel läuft: bitte vor dem Bearbeiten beenden.","ready":"✓ Profil „{name}“ kann bearbeitet werden.","none":"Kein Profil gefunden. Erstelle und speichere eine Karriere.","locked":"Gesperrt","car":"Auto","free":"Frei","slot":"Platz","moneyInvalid":"Ungültiger Betrag (0 bis 2.147.483.647).","pageMissing":"Spielseite nicht gefunden: Änderung abgebrochen.","exitFirst":"Spiel mit F9 → Quit game beenden. Spielstand nicht während des Spielens bearbeiten.","noStorage":"OPFS-Speicher ist in diesem Browser nicht verfügbar.","fileMissing":"Profildatei nicht gefunden.","badFormat":"Nicht erkanntes Speicherformat.","nameMismatch":"Profilname stimmt nicht mit dem Ordner überein.","badChecksums":"Ungültige Prüfsummen: Änderung vorsichtshalber abgebrochen.","badBackup":"Ungültiges lokales Backup.","writeFailed":"Überprüfung der gespeicherten Daten fehlgeschlagen.","partialWrite":"Unvollständiger Schreibvorgang.","selectProfile":"Profil auswählen.","badGeneratedChecksum":"Erzeugte Prüfsummen sind ungültig.","noChange":"Keine Änderungen nötig.","saved":"Änderungen gespeichert. Starte das Spiel neu.","enterAmount":"Betrag eingeben.","chooseSlots":"Auto und freien Platz auswählen.","confirmDuplicate":"Auto von Platz {from} nach {to} duplizieren? Experimentelle Funktion.","invalidSlots":"Ungeeignete Garagenplätze.","profileDownloaded":"Profil heruntergeladen. Bewahre auch ein vollständiges ZIP-Backup auf.","confirmRestore":"Vorheriges RX-Backup für {name} laden? Der aktuelle Fortschritt wird ersetzt.","restored":"Vorheriges Backup geladen. Starte das Spiel neu."},"ru":{"checking":"Проверка игры…","profile":"Профиль карьеры","language":"Язык","auto":"Авто (браузер)","money":"Деньги","garage":"Гараж","tuning":"Тюнинг","safety":"Безопасность","balance":"ТЕКУЩИЙ БАЛАНС","setCash":"Деньги в карьере","applyMoney":"Применить сумму","yourGarage":"ВАШ ГАРАЖ","unlockDesc":"Открывает все 5 мест в гараже. Для машин, которых у вас нет, нужна отдельная разблокировка.","unlockGarage":"Открыть 5 мест","duplicateTitle":"КОПИРОВАТЬ МАШИНУ","duplicateDesc":"Скопировать свою машину в пустое место (экспериментально).","duplicate":"Копировать машину","perfTitle":"УЛУЧШЕНИЯ ХАРАКТЕРИСТИК","perfDesc":"Устанавливает максимальные улучшения для машин в вашем гараже.","maxPerf":"Максимум характеристик (все)","saveTitle":"ЗАЩИТА СОХРАНЕНИЙ","saveDesc":"Перед каждым изменением создаётся локальная копия в отдельной папке OPFS.","downloadBackup":"Скачать копию профиля","restoreBackup":"Восстановить копию RX","refresh":"Обновить профили","warning":"⚠️ Перед изменением выйдите из игры через F9 → Quit game. Для облачных сохранений временно отключите синхронизацию и проверьте конфликты перед её включением. Не редактируйте в другой вкладке.","openTitle":"Открыть RX Mod Menu (F6)","closeTitle":"Закрыть","noProfiles":"Профили не найдены","searching":"Поиск профилей…","playing":"⛔ Игра запущена: выйдите перед изменением.","ready":"✓ Профиль «{name}» готов к изменению.","none":"Профиль не найден. Создайте и сохраните карьеру.","locked":"Закрыто","car":"Машина","free":"Свободно","slot":"Место","moneyInvalid":"Неверная сумма (от 0 до 2 147 483 647).","pageMissing":"Страница игры не найдена: изменение отменено.","exitFirst":"Выйдите через F9 → Quit game. Не меняйте сохранение во время игры.","noStorage":"Хранилище OPFS недоступно в этом браузере.","fileMissing":"Файл профиля не найден.","badFormat":"Неизвестный формат сохранения.","nameMismatch":"Имя профиля не совпадает с папкой.","badChecksums":"Неверные контрольные суммы: изменение отменено.","badBackup":"Неверная локальная копия.","writeFailed":"Не удалось проверить сохранённые данные.","partialWrite":"Неполная запись.","selectProfile":"Выберите профиль.","badGeneratedChecksum":"Созданы неверные контрольные суммы.","noChange":"Изменений нет.","saved":"Изменения сохранены. Перезапустите игру.","enterAmount":"Введите сумму.","chooseSlots":"Выберите машину и пустое место.","confirmDuplicate":"Скопировать машину из места {from} в место {to}? Экспериментальная функция.","invalidSlots":"Несовместимые места.","profileDownloaded":"Профиль скачан. Сохраните также полную ZIP-копию игры.","confirmRestore":"Восстановить предыдущую копию RX для {name}? Текущий прогресс будет заменён.","restored":"Предыдущая копия восстановлена. Перезапустите игру."},"vi":{"checking":"Đang kiểm tra trò chơi…","profile":"Hồ sơ sự nghiệp","language":"Ngôn ngữ","auto":"Tự động (trình duyệt)","money":"Tiền","garage":"Gara","tuning":"Nâng cấp","safety":"An toàn","balance":"SỐ DƯ HIỆN TẠI","setCash":"Đặt tiền sự nghiệp","applyMoney":"Áp dụng tiền","yourGarage":"GARA CỦA BẠN","unlockDesc":"Mở cả 5 chỗ để xe. Xe chưa sở hữu cần được mở khóa riêng.","unlockGarage":"Mở 5 chỗ để xe","duplicateTitle":"NHÂN BẢN XE","duplicateDesc":"Sao chép một xe vào chỗ trống (thử nghiệm).","duplicate":"Nhân bản xe","perfTitle":"NÂNG CẤP HIỆU SUẤT","perfDesc":"Nâng hiệu suất tối đa cho các xe hiện có trong gara.","maxPerf":"Hiệu suất tối đa (mọi xe)","saveTitle":"BẢO VỆ BẢN LƯU","saveDesc":"Một bản sao cục bộ được tạo trước mỗi thay đổi trong thư mục OPFS riêng.","downloadBackup":"Tải bản sao hồ sơ","restoreBackup":"Khôi phục bản RX gần nhất","refresh":"Làm mới hồ sơ","warning":"⚠️ Thoát trò chơi bằng F9 → Quit game trước khi chỉnh sửa. Với bản lưu đám mây, hãy tạm tắt đồng bộ và kiểm tra xung đột trước khi bật lại. Không chỉnh sửa từ tab khác.","openTitle":"Mở RX Mod Menu (F6)","closeTitle":"Đóng","noProfiles":"Không tìm thấy hồ sơ","searching":"Đang tìm hồ sơ…","playing":"⛔ Trò chơi đang chạy: hãy thoát trước khi chỉnh sửa.","ready":"✓ Hồ sơ “{name}” sẵn sàng chỉnh sửa.","none":"Chưa có hồ sơ. Hãy tạo và lưu sự nghiệp.","locked":"Đã khóa","car":"Xe","free":"Trống","slot":"Chỗ","moneyInvalid":"Số tiền không hợp lệ (0 đến 2.147.483.647).","pageMissing":"Không tìm thấy trang trò chơi: đã hủy chỉnh sửa.","exitFirst":"Thoát bằng F9 → Quit game. Không chỉnh sửa bản lưu khi đang chơi.","noStorage":"Bộ nhớ OPFS không có trong trình duyệt này.","fileMissing":"Không tìm thấy tệp hồ sơ.","badFormat":"Định dạng bản lưu không được hỗ trợ.","nameMismatch":"Tên bản lưu không khớp thư mục.","badChecksums":"Checksum không hợp lệ: đã hủy chỉnh sửa để an toàn.","badBackup":"Bản sao cục bộ không hợp lệ.","writeFailed":"Không thể xác minh dữ liệu đã lưu.","partialWrite":"Ghi dữ liệu chưa hoàn tất.","selectProfile":"Hãy chọn hồ sơ.","badGeneratedChecksum":"Checksum tạo ra không hợp lệ.","noChange":"Không có thay đổi.","saved":"Đã lưu thay đổi. Khởi động lại trò chơi.","enterAmount":"Nhập số tiền.","chooseSlots":"Chọn xe và chỗ trống.","confirmDuplicate":"Sao chép xe từ chỗ {from} sang {to}? Tính năng thử nghiệm.","invalidSlots":"Các chỗ không tương thích.","profileDownloaded":"Đã tải hồ sơ. Hãy giữ cả bản sao ZIP đầy đủ của trò chơi.","confirmRestore":"Khôi phục bản RX trước đó cho {name}? Tiến trình hiện tại sẽ bị thay thế.","restored":"Đã khôi phục bản trước. Khởi động lại trò chơi."},"zh":{"checking":"正在检查游戏…","profile":"生涯存档","language":"语言","auto":"自动（浏览器）","money":"金钱","garage":"车库","tuning":"改装","safety":"安全","balance":"当前余额","setCash":"设置生涯资金","applyMoney":"应用金额","yourGarage":"你的车库","unlockDesc":"解锁全部 5 个车库车位。未拥有的车辆需要另外解锁。","unlockGarage":"解锁 5 个车位","duplicateTitle":"复制已有车辆","duplicateDesc":"将一辆已有车辆复制到空车位（实验性）。","duplicate":"复制车辆","perfTitle":"性能升级","perfDesc":"将车库中已有车辆的性能升级至最高。","maxPerf":"全部车辆性能最大化","saveTitle":"存档保护","saveDesc":"每次修改前都会在独立的 OPFS 文件夹中创建本地备份。","downloadBackup":"下载存档备份","restoreBackup":"恢复上次 RX 备份","refresh":"刷新存档列表","warning":"⚠️ 修改前请通过 F9 → Quit game 退出游戏。使用云存档时，请先暂时关闭同步，并在重新启用前检查冲突。不要在其他标签页中修改存档。","openTitle":"打开 RX Mod Menu (F6)","closeTitle":"关闭","noProfiles":"未找到存档","searching":"正在搜索存档…","playing":"⛔ 游戏正在运行：请退出后再修改。","ready":"✓ 存档“{name}”可以修改。","none":"未找到存档。请先创建并保存生涯。","locked":"锁定","car":"车辆","free":"空闲","slot":"车位","moneyInvalid":"金额无效（0 至 2,147,483,647）。","pageMissing":"未找到游戏页面：取消修改。","exitFirst":"请通过 F9 → Quit game 退出游戏。不要在游戏运行时修改存档。","noStorage":"此浏览器不支持 OPFS 存储。","fileMissing":"未找到存档文件。","badFormat":"存档格式不兼容或无法识别。","nameMismatch":"存档名称与文件夹不匹配。","badChecksums":"校验和无效：为安全起见已取消修改。","badBackup":"本地备份无效。","writeFailed":"无法验证已写入的存档。","partialWrite":"写入不完整。","selectProfile":"请选择存档。","badGeneratedChecksum":"生成的校验和无效。","noChange":"没有需要应用的更改。","saved":"修改已保存。重新启动游戏后生效。","enterAmount":"请输入金额。","chooseSlots":"请选择车辆和空车位。","confirmDuplicate":"将车位 {from} 的车辆复制到车位 {to}？此功能仍处于实验阶段。","invalidSlots":"车位不兼容。","profileDownloaded":"存档已下载。也请保留完整的游戏 ZIP 备份。","confirmRestore":"恢复 {name} 的上一个 RX 备份？当前进度将被覆盖。","restored":"已恢复上一个备份。请重新启动游戏。"},"ja":{"checking":"ゲームを確認中…","profile":"キャリアプロフィール","language":"言語","auto":"自動（ブラウザ）","money":"お金","garage":"ガレージ","tuning":"チューニング","safety":"セーフティ","balance":"現在の所持金","setCash":"キャリア所持金","applyMoney":"所持金を変更","yourGarage":"ガレージ","unlockDesc":"ガレージの5枠をすべて解除します。未所有の車種は別途解除が必要です。","unlockGarage":"5枠を解除","duplicateTitle":"所有車を複製","duplicateDesc":"所有車を空きスロットへコピーします（実験機能）。","duplicate":"車を複製","perfTitle":"性能アップグレード","perfDesc":"ガレージ内の所有車の性能を最大にします。","maxPerf":"全車の性能を最大化","saveTitle":"セーブデータ保護","saveDesc":"変更前に、別の OPFS フォルダーへローカルバックアップを作成します。","downloadBackup":"プロフィールをバックアップ","restoreBackup":"前回のRXバックアップを復元","refresh":"プロフィールを更新","warning":"⚠️ 編集前に F9 → Quit game でゲームを終了してください。クラウドセーブは一時的に同期を無効にし、再開前に競合を確認してください。別のタブから編集しないでください。","openTitle":"RX Mod Menu を開く (F6)","closeTitle":"閉じる","noProfiles":"プロフィールが見つかりません","searching":"プロフィールを検索中…","playing":"⛔ ゲーム実行中：編集する前に終了してください。","ready":"✓ プロフィール「{name}」を編集できます。","none":"プロフィールがありません。キャリアを作成し保存してください。","locked":"ロック中","car":"車","free":"空き","slot":"スロット","moneyInvalid":"金額が無効です（0～2,147,483,647）。","pageMissing":"ゲームページがありません。編集を中止しました。","exitFirst":"F9 → Quit game で終了してください。プレイ中はセーブを編集しないでください。","noStorage":"このブラウザでは OPFS ストレージを使用できません。","fileMissing":"プロフィールファイルが見つかりません。","badFormat":"セーブ形式が未対応です。","nameMismatch":"セーブ名がフォルダーと一致しません。","badChecksums":"チェックサムが無効です。安全のため編集を中止しました。","badBackup":"ローカルバックアップが無効です。","writeFailed":"保存データの検証に失敗しました。","partialWrite":"書き込みが完了していません。","selectProfile":"プロフィールを選択してください。","badGeneratedChecksum":"生成したチェックサムが無効です。","noChange":"変更はありません。","saved":"変更を保存しました。ゲームを再起動してください。","enterAmount":"金額を入力してください。","chooseSlots":"車と空きスロットを選んでください。","confirmDuplicate":"スロット{from}の車を{to}へ複製しますか？実験機能です。","invalidSlots":"スロットが適合しません。","profileDownloaded":"プロフィールをダウンロードしました。ゲーム全体のZIPバックアップも保管してください。","confirmRestore":"{name}の前回のRXバックアップを復元しますか？現在の進行状況は上書きされます。","restored":"前回のバックアップを復元しました。ゲームを再起動してください。"},"tr":{"checking":"Oyun kontrol ediliyor…","profile":"Kariyer profili","language":"Dil","auto":"Otomatik (tarayıcı)","money":"Para","garage":"Garaj","tuning":"Modifiye","safety":"Güvenlik","balance":"MEVCUT BAKİYE","setCash":"Kariyer parasını ayarla","applyMoney":"Parayı uygula","yourGarage":"GARAJIN","unlockDesc":"5 garaj yuvasının tamamını açar. Sahip olmadığın araçlar ayrıca açılmalıdır.","unlockGarage":"5 Garaj Yuvasını Aç","duplicateTitle":"MEVCUT ARACI ÇOĞALT","duplicateDesc":"Araçlarından birini boş bir garaj yuvasına kopyala.","duplicate":"Aracı Çoğalt","perfTitle":"PERFORMANS YÜKSELTMELERİ","perfDesc":"Garajındaki araçların performans yükseltmelerini en üst seviyeye çıkar.","maxPerf":"Maksimum Performans (Tüm Araçlar)","saveTitle":"KAYIT KORUMASI","saveDesc":"Her değişiklikten önce ayrı bir OPFS klasörüne yerel kopya alınır.","downloadBackup":"Profil Yedeğini İndir","restoreBackup":"Son RX Yedeğini Geri Yükle","refresh":"Profilleri Yenile","warning":"⚠️ Düzenlemeden önce F9 → Quit game ile oyundan çık. Bulut kayıtlarında eşitlemeyi geçici olarak kapat ve yeniden açmadan önce çakışmaları kontrol et. Dosyaları başka bir sekmeden düzenleme.","openTitle":"RX Mod Menüsünü Aç (F6)","closeTitle":"Kapat","noProfiles":"Profil bulunamadı","searching":"Profiller aranıyor…","playing":"⛔ Oyun çalışıyor: düzenlemeden önce oyundan çık.","ready":"✓ “{name}” profili düzenlemeye hazır.","none":"Profil bulunamadı. Önce bir kariyer oluşturup kaydet.","locked":"Kilitli","car":"Araç","free":"Boş","slot":"Yuva","moneyInvalid":"Geçersiz miktar (0 ile 2.147.483.647 arasında olmalı).","pageMissing":"Oyun sayfası bulunamadı: düzenleme iptal edildi.","exitFirst":"F9 → Quit game ile oyundan çık. Oyun açıkken kayıtları asla düzenleme.","noStorage":"Bu tarayıcıda OPFS depolaması kullanılamıyor.","fileMissing":"Profil dosyası bulunamadı.","badFormat":"Uyumsuz veya tanınmayan kayıt biçimi.","nameMismatch":"Kayıt adı klasör adıyla eşleşmiyor.","badChecksums":"Sağlama toplamları geçersiz: güvenlik için düzenleme iptal edildi.","badBackup":"Geçersiz yerel yedek.","writeFailed":"Kaydedilen veriler doğrulanamadı.","partialWrite":"Eksik yazma algılandı.","selectProfile":"Bir profil seç.","badGeneratedChecksum":"Oluşturulan sağlama toplamları geçersiz.","noChange":"Uygulanacak değişiklik yok.","saved":"Değişiklikler kaydedildi. Yüklemek için oyunu yeniden başlat.","enterAmount":"Bir miktar gir.","chooseSlots":"Bir araç ve boş bir yuva seç.","confirmDuplicate":"{from} numaralı yuvadaki araç {to} numaralı yuvaya çoğaltılsın mı? Garajı değiştirmeden önce yedek al.","invalidSlots":"Uyumsuz garaj yuvaları.","profileDownloaded":"Profil indirildi. Oyunun tamamı için ZIP yedeği de sakla.","confirmRestore":"{name} için önceki RX yedeği geri yüklensin mi? Mevcut ilerleme değiştirilecek.","restored":"Önceki yedek geri yüklendi. Oyunu yeniden başlat."}};
  const PROFILE_SIZE = 54966;
  const MONEY_OFFSET = 0xA16A;
  const SLOT_OFFSET = 0x5AEC;
  const CAR_BASE = 0x5870;
  const SLOT_SIZE = 0x7F2;
  const SLOT_COUNT = 5;
  const LOCK_OFFSET = 0x1AC;
  const PERF_OFFSET = 0x94;
  const PERF_LEN = 0x44;
  const MONEY_MAX = 2147483647;
  const LOCALE_KEY = 'rx-nfsu2-language-v03';
  const POS_KEY = 'rx-nfsu2-launcher-pos-v05';
  const LIVE_KEY = 'rx-nfsu2-live-shops-enabled-v1';
  // One-time compatibility migration for preferences saved by older releases.
  try {
    const legacyKeys = [atob('aG16LW5mc3UyLWxhbmd1YWdlLXYwMw=='), atob('aG16LW5mc3UyLWxhdW5jaGVyLXBvcy12MDU='), atob('aG16LW5mc3UyLWxpdmUtc2hvcHMtZW5hYmxlZC12MQ==')];
    const currentKeys = [LOCALE_KEY, POS_KEY, LIVE_KEY];
    currentKeys.forEach((key, i) => { if (localStorage.getItem(key) === null) { const oldValue = localStorage.getItem(legacyKeys[i]); if (oldValue !== null) localStorage.setItem(key, oldValue); } });
  } catch {}
  const LOCALES = { en:'English', tr:'Türkçe', fr:'Français', es:'Español', pt:'Português', ru:'Русский', de:'Deutsch', vi:'Tiếng Việt', zh:'中文', ja:'日本語' };
  const MORE = {"en":{"vehicleUnlocks":"VEHICLE UNLOCKS","unlockAllVehicles":"Unlock All Vehicles","vehicleUnlockNote":"Unlocks 25 Car Lot models. All 49 known vehicles and special variants are already in Choose a vehicle below; special models must be added to a garage slot.","confirmAllVehicles":"Unlock all 25 vehicles available at the Car Lot for this career profile? A local backup will be created automatically.","paintAccessInfo":"Graphics Shops are available through Career → Live Graphics Shops. Enter a Graphics Shop in game to change paint, colors, vinyls and decals. Your changes save normally.","shopUnlockTitle":"OTHER SHOP UNLOCKS","liveShopTitle":"LIVE GRAPHICS SHOPS","liveShopDesc":"Turn this on from the homepage or during a game. It reveals the red Graphics Shop markers through the game engine when play starts. Enter a shop to customize paint and vinyls. Preference is remembered; this does not edit your career save.","liveShopOn":"Enable Live Shop Markers","liveShopOff":"Disable Live Shop Markers","liveShopReady":"Live markers enabled. Open or reopen the World Map.","liveShopWaiting":"Enabled. The shops will appear when you start the game.","liveShopMissing":"Game memory unavailable. Enable this script before loading the page, then Ctrl+F5.","liveShopOffStatus":"Live switch is off. Your career save is unchanged.","legacyShopFlag":"Save Map Flags (Legacy)","cars":"Cars","carInjector":"CAR COLLECTION","chooseCar":"Choose a vehicle","targetSlot":"Garage destination","addCar":"Add / Replace Car","carNote":"Vehicle injection for your career. Back up the game first; regional variants may be incompatible with some installations.","editSlot":"Select a garage slot","unlockOne":"Unlock Selected Slot","lockEmpty":"Lock Empty Slot","cloneTitle":"CLONE AN EXISTING CAR","swapTitle":"SWAP GARAGE SLOTS","swapCars":"Swap Slots","copyCar":"Duplicate Car","garageNotice":"Slots may be locked even when a car is present.","perfAll":"ALL OWNED VEHICLES","maxAll":"Max Performance — All","stockAll":"Stock Performance — All","perfOne":"SELECTED VEHICLE","maxOne":"Max Selected Car","stockOne":"Stock Selected Car","unlockTuning":"UNLOCK CATEGORIES","unlockParts":"Unlock selected category","category":"Part category","catAll":"All listed categories","catBody":"Body Parts","catSpecial":"Specialties","catGraphics":"Graphics","catPerf":"Performance shop","unlockNote":"The mapped unlock flags are applied to the selected car. A safety backup is created automatically.","moneyTools":"CASH SHORTCUTS","addCash":"Add to current balance","add10":"+$10K","add100":"+$100K","addMillion":"+$1M","resetCash":"Set to $0","stats":"PROFILE OVERVIEW","carsCount":"Garage cars","slotCount":"Available slots","verified":"Checksum verified","restoreFile":"Restore a local profile file","importFile":"Import .bin / profile file","snapshots":"HISTORY / RESTORE","makeBackup":"Save Snapshot Now","restoreSelected":"Restore Selected Snapshot","latestBackup":"Restore Last RX Backup","downloadBackup":"Download Profile Backup","refresh":"Refresh Profiles","selectSnapshot":"Choose a saved snapshot","tools":"Tools","moveHint":"Drag the RX icon to move it. F6 toggles the menu.","resetPos":"Reset Icon Position","backupTitle":"SAFETY FIRST","backupDesc":"Automatic local snapshots before every edit. Download an external backup too.","gameBackup":"For full protection, also use the game’s Saves → Download backup ZIP.","statusPlaying":"Game running — exit with F9 → Quit game","statusReady":"✓ Profile “{name}” ready to edit.","statusNo":"No valid career profile found.","confirmInject":"Inject “{car}” into slot {slot}? This replaces any car there. Back up your game first.","confirmSwap":"Swap garage slots {a} and {b}? Keep a backup before swapping slots.","confirmLock":"Lock empty garage slot {slot}?","confirmUnlock":"Set “{category}” unlock flags on slot {slot}? Backup is automatic.","confirmImport":"Restore the local file to profile “{name}”? Current progress will be replaced.","confirmHistory":"Restore this older snapshot of “{name}”? Current progress will be replaced.","confirmStock":"Remove all performance flag upgrades for {scope}?","noSource":"Select a valid vehicle and garage slot.","noCars":"No cars in garage.","noHistory":"No RX snapshots yet.","snapshotSaved":"Snapshot saved locally.","newBackup":"Backup downloaded.","imported":"Backup imported successfully.","modified":"Save updated successfully.","errorBusy":"Exit the game with F9 → Quit game before editing.","originalMiss":"Unable to read this profile.","invalidBackup":"This is not a valid, matching NFSU2 profile.","invalidAmount":"Enter an amount from $0 to $2,147,483,647.","noChange":"Already set — no changes required.","selectedSlotEmpty":"Selected slot has no car.","unlocked":"Unlocked","locked":"Locked","empty":"Empty","filled":"Car","changes":"Changes saved — refresh your game before playing.","noEffect":"No applicable data to change.","move":"Move","undo":"Undo","remove":"Remove","overview":"OVERVIEW","drag":"Drag to move","beta":"New","noActive":"No profile selected","fileTooBig":"Invalid file size.","restored":"Backup restored.","support":"Compatible with NFSU2 Revived local career saves; no game server is modified.","carSearch":"Search car / variant","carCount":"Vehicles available: {count}","carTuned":"Add car with max performance + unlocked parts","carLibrary":"EXTENDED VEHICLE LIBRARY","importDonors":"Import vehicle database (JSON)","donorsNote":"49 vehicles already included. Optional: load a custom compatible car-donors.json for additional presets. Files stay in your browser.","stageTitle":"NITROUS, TURBO & TIRE TIERS","stageGroup":"Choose upgrade","stageLevel":"Package tier","applyStage":"Apply stage to selected car","uniqueTitle":"UNIQUE PERFORMANCE UPGRADES","uniqueCategory":"Unique category","uniqueOn":"Enable unique upgrade","uniqueOff":"Disable unique upgrade","uniqueAll":"Enable all 9 unique upgrades","uniqueClear":"Disable all 9","uniqueNote":"New: sets the nine saved unique-performance flags. Game integration must be checked.","unlockAllCars":"Unlock category for all garage cars","dynoTitle":"DYNO — 5 RACE SETUPS","dynoRace":"Race setup","dynoCurve":"Tune curves","dynoPreset":"Curve profile","dynoApply":"Apply dyno preset","dynoNote":"New: modifies ECU/Turbo curve bytes for this car and race mode (100 = neutral). Test handling in game.","dynoNeutral":"Neutral (100)","dynoLow":"Lower-RPM emphasis","dynoHigh":"Higher-RPM emphasis","dynoFlat":"Even response (+20)","stageNone":"Stock / no package","stageStreet":"Street (Stage 1)","stagePro":"Pro (Stage 2)","stageExtreme":"Extreme (Stage 3)","stageNitrous":"Nitrous","stageTurbo":"Turbo","stageTires":"Tires","selectedCar":"Select a car first.","customize":"Customize","career":"Career","paintAndVinyls":"PAINTS & VINYLS","visualUnlock":"FULL VISUAL CUSTOMIZATION","bodyUnlock":"Unlock Body Kits + Widebody","allVisualUnlock":"Unlock All Visual Upgrades","shopsOnly":"Reveal All Map Shops (58)","lotOnly":"Unlock All 25 Car Lot Vehicles","globalTiers":"Unlock Level 3 Shop Tiers","careerStatus":"CAREER & SHOP STATUS","shopsFound":"Map shops discovered","carLotCount":"Car lot models","shopTier":"Shop tier","careerSafe":"CAREER-PRESERVING UNLOCKS","safeUnlock":"Unlock Everything — Keep Races & Story","careerKeep":"These actions reveal available vehicles, shops and visual/performance catalog tiers. They do not complete races, skip story events or force 100% campaign completion.","featureNote":"Make a full game ZIP backup first. Menu changes apply only after exiting the running game. Some upgrades remain dependent on the shop being accessible in your current career district.","appearance":"COPY VEHICLE APPEARANCE","lookSource":"Source car (custom paint & vinyls)","lookDest":"Destination car (same model)","copyLook":"Copy Look Between Same-Model Cars","lookNote":"Copies the vehicle appearance blocks including paint/vinyl customization. Both slots must contain the same model. Source car stays unchanged; destination gets an automatic snapshot.","lookModelError":"Source and destination must contain the same car model.","lookDistinctError":"Choose two different garage slots.","careerReview":"PROGRESSION OVERVIEW","careerOverview":"Displayed data is read from this local save only, not from a server. Story progress is left intact.","careerCompleted":"100% completion flag","yes":"Yes","no":"No","shopsUnlockSuccess":"Shop locations, car catalogs and graphics unlocks updated."},"fr":{"vehicleUnlocks":"DÉBLOCAGE DES VOITURES","unlockAllVehicles":"Débloquer tous les véhicules","vehicleUnlockNote":"Débloque les 25 modèles des concessions. Les 49 voitures et variantes spéciales sont déjà disponibles ci-dessous ; les variantes doivent être ajoutées dans une place de garage.","confirmAllVehicles":"Débloquer les 25 véhicules des concessions pour cette carrière ? Une sauvegarde locale sera créée automatiquement.","paintAccessInfo":"Les Graphics Shops sont accessibles via Career → Live Graphics Shops. Entre dans un atelier dans le jeu pour modifier les peintures, couleurs, vinyles et autocollants. Les changements se sauvegardent normalement.","shopUnlockTitle":"AUTRES DÉBLOCAGES DES MAGASINS","liveShopTitle":"GRAPHICS SHOPS EN DIRECT","liveShopDesc":"Active cette option dès l’accueil ou en jeu. Les points rouges des Graphics Shops apparaissent grâce au moteur lorsque la partie démarre. Entre dans un magasin pour modifier la peinture et les vinyles. Ton choix ON/OFF est mémorisé ; ta sauvegarde reste intacte.","liveShopOn":"Activer les marqueurs en jeu","liveShopOff":"Désactiver les marqueurs en jeu","liveShopReady":"Marqueurs actifs. Rouvre la carte du monde.","liveShopWaiting":"Activé. Les magasins apparaîtront au lancement du jeu.","liveShopMissing":"Mémoire du jeu indisponible. Active le script avant de charger la page puis Ctrl+F5.","liveShopOffStatus":"Fonction désactivée. Sauvegarde inchangée.","legacyShopFlag":"Indicateurs sauvegardés (ancien)","cars":"Voitures","carInjector":"COLLECTION DE VOITURES","chooseCar":"Choisir une voiture","targetSlot":"Place de garage","addCar":"Ajouter / remplacer la voiture","carNote":"Ajoute des voitures à ta carrière. Fais un ZIP du jeu avant ; certaines variantes régionales peuvent être incompatibles.","editSlot":"Choisir un emplacement","unlockOne":"Débloquer la place","lockEmpty":"Verrouiller une place vide","cloneTitle":"DUPLIQUER UNE VOITURE","swapTitle":"ÉCHANGER DEUX PLACES","swapCars":"Échanger les places","copyCar":"Dupliquer","perfAll":"TOUTES LES VOITURES","maxAll":"Performances max — toutes","stockAll":"Performances stock — toutes","perfOne":"VOITURE SÉLECTIONNÉE","maxOne":"Performances max — une voiture","stockOne":"Remettre en stock","unlockTuning":"DÉBLOCAGE DE PIÈCES","unlockParts":"Débloquer la catégorie","category":"Catégorie de pièces","catAll":"Toutes les catégories","catBody":"Carrosserie","catSpecial":"Spécialités","catGraphics":"Graphismes","catPerf":"Boutique performance","unlockNote":"Les catégories de pièces sont appliquées à la voiture sélectionnée. Sauvegarde automatique.","moneyTools":"RACCOURCIS ARGENT","addCash":"Ajouter au solde","resetCash":"Mettre à 0 $","stats":"RÉSUMÉ DU PROFIL","carsCount":"Voitures au garage","slotCount":"Places débloquées","verified":"Intégrité vérifiée","snapshots":"HISTORIQUE / RESTAURATION","makeBackup":"Créer un point de sauvegarde","restoreSelected":"Restaurer le point choisi","latestBackup":"Restaurer le dernier backup","downloadBackup":"Télécharger une sauvegarde","restoreFile":"Restaurer un fichier local","importFile":"Importer un .bin / profil","refresh":"Actualiser les profils","selectSnapshot":"Choisir un point","tools":"Outils","moveHint":"Glisse l’icône RX pour la déplacer. F6 ouvre le menu.","resetPos":"Réinitialiser la position","backupTitle":"PROTECTION DES SAUVEGARDES","backupDesc":"Copies locales automatiques avant chaque modification.","gameBackup":"Fais aussi un ZIP complet dans Saves → Download backup sur le jeu.","statusPlaying":"Jeu en cours — quitte via F9 → Quit game","statusReady":"✓ Profil « {name} » prêt à modifier.","statusNo":"Aucun profil valide trouvé.","noCars":"Aucune voiture au garage.","noHistory":"Aucune sauvegarde RX.","snapshotSaved":"Sauvegarde locale créée.","newBackup":"Sauvegarde téléchargée.","imported":"Sauvegarde importée.","modified":"Sauvegarde modifiée.","errorBusy":"Quitte le jeu avec F9 → Quit game avant modification.","noChange":"Déjà appliqué.","unlocked":"Débloquée","locked":"Bloquée","empty":"Vide","filled":"Voiture","selectedSlotEmpty":"Cet emplacement est vide.","restored":"Sauvegarde restaurée.","beta":"Nouveau","carSearch":"Rechercher une voiture / variante","carCount":"Voitures disponibles : {count}","carTuned":"Ajouter avec performances max + pièces débloquées","carLibrary":"CATALOGUE ÉTENDU","importDonors":"Importer une bibliothèque de voitures (JSON)","donorsNote":"49 véhicules déjà intégrés. Optionnel : importe ton propre fichier car-donors.json compatible pour d’autres modèles. Aucun envoi vers un serveur.","stageTitle":"PALIERS NITRO, TURBO ET PNEUS","stageGroup":"Choisir une amélioration","stageLevel":"Niveau","applyStage":"Appliquer à la voiture","uniqueTitle":"AMÉLIORATIONS UNIQUES","uniqueCategory":"Catégorie unique","uniqueOn":"Activer cette amélioration","uniqueOff":"Désactiver cette amélioration","uniqueAll":"Activer les 9 améliorations uniques","uniqueClear":"Désactiver les 9","uniqueNote":"Nouveau : modifie les neuf indicateurs de performance uniques. À vérifier dans le jeu.","unlockAllCars":"Débloquer la catégorie pour toutes les voitures","dynoTitle":"DYNO — 5 CONFIGURATIONS DE COURSE","dynoRace":"Type de course","dynoCurve":"Courbes à régler","dynoPreset":"Profil de courbe","dynoApply":"Appliquer le preset Dyno","dynoNote":"Nouveau : modifie les octets de courbes ECU/Turbo pour cette voiture et ce type de course (100 = neutre). Tester en jeu.","dynoNeutral":"Neutre (100)","dynoLow":"Accent bas régime","dynoHigh":"Accent haut régime","dynoFlat":"Réponse uniforme (+20)","stageNone":"Origine / sans package","stageStreet":"Street (niveau 1)","stagePro":"Pro (niveau 2)","stageExtreme":"Extreme (niveau 3)","stageNitrous":"Nitro","stageTurbo":"Turbo","stageTires":"Pneus","selectedCar":"Sélectionne une voiture.","customize":"Personnaliser","career":"Carrière","paintAndVinyls":"PEINTURES ET VINYLES","visualUnlock":"PERSONNALISATION COMPLÈTE","bodyUnlock":"Débloquer kits carrosserie + Widebody","allVisualUnlock":"Débloquer toutes les pièces visuelles","shopsOnly":"Révéler les 58 magasins sur la carte","lotOnly":"Débloquer les 25 voitures des concessions","globalTiers":"Débloquer niveaux 3 des magasins","careerStatus":"CARRIÈRE ET MAGASINS","shopsFound":"Magasins découverts","carLotCount":"Modèles en concession","shopTier":"Niveau magasin","careerSafe":"DÉBLOCAGES SANS SKIP LA CARRIÈRE","safeUnlock":"Tout débloquer — conserver courses et scénario","careerKeep":"Ces actions rendent disponibles véhicules, magasins et catalogues de personnalisation/performances. Elles ne terminent aucune course, ne passent pas d’événements et ne forcent pas une carrière à 100 %.","featureNote":"Fais d’abord une sauvegarde ZIP complète du jeu. Les modifications s’appliquent jeu fermé. Certaines pièces restent dépendantes de l’accès à la zone du magasin.","appearance":"COPIER LE STYLE D’UN VÉHICULE","lookSource":"Voiture source (peinture/vinyles)","lookDest":"Voiture cible (même modèle)","copyLook":"Copier le style entre voitures identiques","lookNote":"Copie les blocs visuels dont la peinture et les vinyles. Les deux places doivent contenir le même modèle. Sauvegarde automatique de la voiture cible.","lookModelError":"Choisis deux voitures du même modèle.","lookDistinctError":"Sélectionne deux places différentes.","careerReview":"VUE D’ENSEMBLE DE LA CARRIÈRE","careerOverview":"Données lues dans ta sauvegarde locale uniquement. La progression des courses reste inchangée.","careerCompleted":"Indicateur de carrière à 100 %","yes":"Oui","no":"Non","shopsUnlockSuccess":"Magasins, catalogues de véhicules et pièces graphiques actualisés."},"tr":{"vehicleUnlocks":"ARAÇ KİLİTLERİNİ AÇ","unlockAllVehicles":"Tüm Araçların Kilidini Aç","vehicleUnlockNote":"Galerideki 25 aracı açar. Bilinen 49 araç ve özel varyant zaten aşağıdaki araç seçiminde bulunur; özel modeller garaj yuvasına eklenmelidir.","confirmAllVehicles":"Bu kariyer profili için galerideki 25 aracın tamamı açılsın mı? Otomatik olarak yerel yedek oluşturulacak.","paintAccessInfo":"Grafik mağazalarına Career → Live Graphics Shops üzerinden ulaşılır. Boya, renk, vinil ve çıkartmaları değiştirmek için oyun içinde bir Grafik Mağazasına gir. Değişikliklerin normal şekilde kaydedilir.","shopUnlockTitle":"DİĞER MAĞAZA KİLİTLERİ","liveShopTitle":"CANLI GRAFİK MAĞAZALARI","liveShopDesc":"Bu seçeneği ana ekrandan veya oyun sırasında etkinleştir. Oyun başladığında haritadaki kırmızı Grafik Mağazası işaretlerini oyun motoru üzerinden gösterir. Boya ve vinilleri düzenlemek için mağazaya gir. Tercihin hatırlanır; kariyer kaydını değiştirmez.","liveShopOn":"Canlı Mağaza İşaretlerini Etkinleştir","liveShopOff":"Canlı Mağaza İşaretlerini Devre Dışı Bırak","liveShopReady":"Canlı işaretler etkin. Dünya Haritasını aç veya yeniden aç.","liveShopWaiting":"Etkin. Mağazalar oyunu başlattığında görünecek.","liveShopMissing":"Oyun belleği kullanılamıyor. Sayfa yüklenmeden önce bu betiği etkinleştir, ardından Ctrl+F5 yap.","liveShopOffStatus":"Canlı anahtar kapalı. Kariyer kaydın değiştirilmedi.","legacyShopFlag":"Harita Bayraklarını Kaydet (Eski Yöntem)","cars":"Araçlar","carInjector":"ARAÇ KOLEKSİYONU","chooseCar":"Bir araç seç","targetSlot":"Garaj hedefi","addCar":"Araç Ekle / Değiştir","carNote":"Kariyerine araç ekler. Önce oyunu yedekle; bölgesel varyantlar bazı kurulumlarla uyumsuz olabilir.","editSlot":"Bir garaj yuvası seç","unlockOne":"Seçili Yuvanın Kilidini Aç","lockEmpty":"Boş Yuvayı Kilitle","cloneTitle":"MEVCUT BİR ARACI KOPYALA","swapTitle":"GARAJ YUVALARINI DEĞİŞTİR","swapCars":"Yuvaları Değiştir","copyCar":"Aracı Çoğalt","garageNotice":"İçinde araç olsa bile yuvalar kilitli olabilir.","perfAll":"SAHİP OLUNAN TÜM ARAÇLAR","maxAll":"Maksimum Performans — Tümü","stockAll":"Standart Performans — Tümü","perfOne":"SEÇİLİ ARAÇ","maxOne":"Seçili Aracı En Üst Seviyeye Çıkar","stockOne":"Seçili Aracı Standart Hâle Getir","unlockTuning":"MODİFİYE KATEGORİLERİNİ AÇ","unlockParts":"Seçili Kategorinin Kilidini Aç","category":"Parça kategorisi","catAll":"Listelenen tüm kategoriler","catBody":"Kaporta Parçaları","catSpecial":"Özel Parçalar","catGraphics":"Grafik","catPerf":"Performans Mağazası","unlockNote":"Eşlenen kilit açma bayrakları seçili araca uygulanır. Otomatik güvenlik yedeği oluşturulur.","moneyTools":"PARA KISAYOLLARI","addCash":"Mevcut bakiyeye ekle","add10":"+$10 BİN","add100":"+$100 BİN","addMillion":"+$1 MİLYON","resetCash":"0 $ olarak ayarla","stats":"PROFİL ÖZETİ","carsCount":"Garajdaki araçlar","slotCount":"Kullanılabilir yuvalar","verified":"Sağlama toplamı doğrulandı","restoreFile":"Yerel profil dosyasını geri yükle","importFile":".bin / profil dosyasını içe aktar","snapshots":"GEÇMİŞ / GERİ YÜKLE","makeBackup":"Şimdi Anlık Yedek Al","restoreSelected":"Seçili Anlık Yedeği Geri Yükle","latestBackup":"Son RX Yedeğini Geri Yükle","downloadBackup":"Profil Yedeğini İndir","refresh":"Profilleri Yenile","selectSnapshot":"Kaydedilmiş bir anlık yedek seç","tools":"Araçlar","moveHint":"Taşımak için RX simgesini sürükle. F6 menüyü açar/kapatır.","resetPos":"Simge Konumunu Sıfırla","backupTitle":"ÖNCE GÜVENLİK","backupDesc":"Her düzenlemeden önce otomatik yerel anlık yedek alınır. Ayrıca harici yedek indir.","gameBackup":"Tam koruma için oyunun Saves → Download backup ZIP seçeneğini de kullan.","statusPlaying":"Oyun çalışıyor — F9 → Quit game ile çık.","statusReady":"✓ “{name}” profili düzenlemeye hazır.","statusNo":"Geçerli kariyer profili bulunamadı.","confirmInject":"“{car}” {slot} numaralı yuvaya eklensin mi? Oradaki araç değiştirilecek. Önce oyunu yedekle.","confirmSwap":"{a} ve {b} numaralı garaj yuvaları değiştirilsin mi? Önce yedek al.","confirmLock":"{slot} numaralı boş garaj yuvası kilitlensin mi?","confirmUnlock":"{slot} numaralı yuvaya “{category}” kilit açma bayrakları uygulansın mı? Otomatik yedek alınır.","confirmImport":"Yerel dosya “{name}” profiline geri yüklensin mi? Mevcut ilerleme değiştirilecek.","confirmHistory":"“{name}” profilinin eski anlık yedeği geri yüklensin mi? Mevcut ilerleme değiştirilecek.","confirmStock":"{scope} için tüm performans yükseltme bayrakları kaldırılsın mı?","noSource":"Geçerli bir araç ve garaj yuvası seç.","noCars":"Garajda araç yok.","noHistory":"Henüz RX anlık yedeği yok.","snapshotSaved":"Anlık yedek yerel olarak kaydedildi.","newBackup":"Yedek indirildi.","imported":"Yedek başarıyla içe aktarıldı.","modified":"Kayıt başarıyla güncellendi.","errorBusy":"Düzenlemeden önce F9 → Quit game ile oyundan çık.","originalMiss":"Bu profil okunamadı.","invalidBackup":"Bu, geçerli ve eşleşen bir NFSU2 profili değil.","invalidAmount":"0 $ ile 2.147.483.647 $ arasında bir miktar gir.","noChange":"Zaten ayarlanmış — değişiklik gerekmiyor.","selectedSlotEmpty":"Seçili yuvada araç yok.","unlocked":"Kilidi Açık","locked":"Kilitli","empty":"Boş","filled":"Araç Var","changes":"Değişiklikler kaydedildi — oynamadan önce oyunu yenile.","noEffect":"Değiştirilecek uygun veri yok.","move":"Taşı","undo":"Geri Al","remove":"Kaldır","overview":"GENEL BAKIŞ","drag":"Taşımak için sürükle","beta":"Yeni","noActive":"Profil seçilmedi","fileTooBig":"Geçersiz dosya boyutu.","restored":"Yedek geri yüklendi.","support":"NFSU2 Revived yerel kariyer kayıtlarıyla uyumludur; oyun sunucusunda değişiklik yapmaz.","carSearch":"Araç / varyant ara","carCount":"Kullanılabilir araçlar: {count}","carTuned":"Maksimum performans ve açık parçalarla araç ekle","carLibrary":"GENİŞLETİLMİŞ ARAÇ KÜTÜPHANESİ","importDonors":"Araç veritabanını içe aktar (JSON)","donorsNote":"49 araç zaten dahil. Ek hazır ayarlar için isteğe bağlı olarak özel uyumlu car-donors.json yükle. Dosyalar tarayıcında kalır.","stageTitle":"NİTRÖS, TURBO VE LASTİK KADEMELERİ","stageGroup":"Yükseltme seç","stageLevel":"Paket seviyesi","applyStage":"Seçili araca kademeyi uygula","uniqueTitle":"ÖZEL PERFORMANS YÜKSELTMELERİ","uniqueCategory":"Özel kategori","uniqueOn":"Özel yükseltmeyi etkinleştir","uniqueOff":"Özel yükseltmeyi devre dışı bırak","uniqueAll":"9 özel yükseltmenin tümünü etkinleştir","uniqueClear":"9 özel yükseltmenin tümünü devre dışı bırak","uniqueNote":"Yeni: kaydedilen dokuz özel performans bayrağını ayarlar. Oyun içi uyumluluk kontrol edilmelidir.","unlockAllCars":"Garajdaki tüm araçlar için kategorinin kilidini aç","dynoTitle":"DYNO — 5 YARIŞ AYARI","dynoRace":"Yarış ayarı","dynoCurve":"Ayarlama eğrileri","dynoPreset":"Eğri profili","dynoApply":"Dyno ayarını uygula","dynoNote":"Yeni: Bu araç ve yarış modu için ECU/Turbo eğrisi baytlarını değiştirir (100 = nötr). Yol tutuşunu oyunda test et.","dynoNeutral":"Nötr (100)","dynoLow":"Düşük devir odaklı","dynoHigh":"Yüksek devir odaklı","dynoFlat":"Dengeli tepki (+20)","stageNone":"Standart / paket yok","stageStreet":"Street (Kademe 1)","stagePro":"Pro (Kademe 2)","stageExtreme":"Extreme (Kademe 3)","stageNitrous":"Nitröz","stageTurbo":"Turbo","stageTires":"Lastikler","selectedCar":"Önce bir araç seç.","customize":"Özelleştir","career":"Kariyer","paintAndVinyls":"BOYALAR VE VİNİLLER","visualUnlock":"TAM GÖRSEL ÖZELLEŞTİRME","bodyUnlock":"Kaporta Kitleri + Widebody Kilidini Aç","allVisualUnlock":"Tüm Görsel Yükseltmelerin Kilidini Aç","shopsOnly":"Haritadaki Tüm Mağazaları Göster (58)","lotOnly":"Galerideki 25 Aracın Kilidini Aç","globalTiers":"Mağaza Seviyesi 3 Kilidini Aç","careerStatus":"KARİYER VE MAĞAZA DURUMU","shopsFound":"Keşfedilen harita mağazaları","carLotCount":"Galerideki araç modelleri","shopTier":"Mağaza seviyesi","careerSafe":"KARİYERİ KORUYAN KİLİT AÇMALAR","safeUnlock":"Her Şeyin Kilidini Aç — Yarışları ve Hikâyeyi Koru","careerKeep":"Bu işlemler araçları, mağazaları ve görsel/performans katalog seviyelerini kullanılabilir hâle getirir. Yarışları tamamlamaz, hikâye etkinliklerini atlamaz veya kariyeri zorla %100 yapmaz.","featureNote":"Önce oyunun tamamı için ZIP yedeği al. Menü değişiklikleri yalnızca oyun kapalıyken uygulanır. Bazı parçalar mevcut kariyer bölgenizdeki mağazaya erişime bağlıdır.","appearance":"ARAÇ GÖRÜNÜMÜNÜ KOPYALA","lookSource":"Kaynak araç (boya/viniller)","lookDest":"Hedef araç (aynı model)","copyLook":"Aynı Model Araçlar Arasında Görünümü Kopyala","lookNote":"Boya ve vinil özelleştirmeleri dahil araç görünüm verilerini kopyalar. İki yuvada da aynı model bulunmalıdır. Kaynak araç değişmez; hedef için otomatik anlık yedek alınır.","lookModelError":"Kaynak ve hedefte aynı araç modeli bulunmalı.","lookDistinctError":"Birbirinden farklı iki garaj yuvası seç.","careerReview":"İLERLEME ÖZETİ","careerOverview":"Gösterilen veriler yalnızca bu yerel kayıttan okunur, sunucudan alınmaz. Hikâye ilerlemesi korunur.","careerCompleted":"%100 Tamamlanma bayrağı","yes":"Evet","no":"Hayır","shopsUnlockSuccess":"Mağaza konumları, araç katalogları ve grafik kilitleri güncellendi."}};

  const SPECIAL_TEXT = {"en":{"specialCars":"Special Cars","specialTitle":"SPECIAL VEHICLES","specialDescription":"Boss cars, character builds, sponsor liveries and rare intro variants. Separate from the regular collection, using the same safe save editor.","specialAll":"All","specialBoss":"Bosses","specialCharacter":"Characters","specialSponsor":"Sponsors","specialIntro":"Intro","specialOther":"Other","specialSelect":"Choose special vehicle","specialDestination":"Garage destination","specialAdd":"Add / Replace Special Car","specialAddTuned":"Add with max performance + parts","specialCount":"Special variants: {count}","specialPreview":"{category} · {name}","specialNone":"No special vehicle in this category.","specialNote":"Special variants are inserted into one of your five garage slots. Make a full backup first; some rare and regional models may behave differently in-game.","hideMenu":"Hide Menu (F8)"},"fr":{"specialCars":"Voitures spéciales","specialTitle":"VOITURES SPÉCIALES","specialDescription":"Voitures des boss, des personnages, des sponsors et de l’introduction, séparées de la collection classique.","specialAll":"Toutes","specialBoss":"Boss","specialCharacter":"Personnages","specialSponsor":"Sponsors","specialIntro":"Intro","specialOther":"Autres","specialSelect":"Choisir un véhicule spécial","specialDestination":"Emplacement de garage","specialAdd":"Ajouter / remplacer la voiture","specialAddTuned":"Ajouter avec performances max + pièces","specialCount":"Variantes spéciales : {count}","specialPreview":"{category} · {name}","specialNone":"Aucune voiture dans cette catégorie.","specialNote":"Les variantes sont ajoutées dans une des cinq places de garage. Fais une sauvegarde complète avant tout remplacement ; certaines variantes peuvent réagir différemment en jeu.","hideMenu":"Masquer le menu (F8)"},"es":{"specialCars":"Coches especiales","specialTitle":"VEHÍCULOS ESPECIALES","specialDescription":"Coches de jefes, personajes, patrocinadores y variantes de introducción.","specialAll":"Todos","specialBoss":"Jefes","specialCharacter":"Personajes","specialSponsor":"Patrocinadores","specialIntro":"Intro","specialOther":"Otros","specialSelect":"Elegir vehículo especial","specialDestination":"Plaza de garaje","specialAdd":"Añadir / reemplazar coche","specialAddTuned":"Añadir con rendimiento máximo","specialCount":"Variantes especiales: {count}","specialPreview":"{category} · {name}","specialNone":"No hay vehículos en esta categoría.","specialNote":"Realiza una copia de seguridad antes de sustituir un coche. Algunas variantes pueden comportarse de forma distinta.","hideMenu":"Ocultar menú (F8)"},"pt":{"specialCars":"Carros especiais","specialTitle":"VEÍCULOS ESPECIAIS","specialDescription":"Carros de chefes, personagens, patrocinadores e variantes de introdução.","specialAll":"Todos","specialBoss":"Chefes","specialCharacter":"Personagens","specialSponsor":"Patrocinadores","specialIntro":"Intro","specialOther":"Outros","specialSelect":"Escolher veículo especial","specialDestination":"Vaga da garagem","specialAdd":"Adicionar / substituir carro","specialAddTuned":"Adicionar com desempenho máximo","specialCount":"Variantes especiais: {count}","specialPreview":"{category} · {name}","specialNone":"Nenhum veículo nesta categoria.","specialNote":"Faça backup antes de substituir um carro. Algumas variantes podem comportar-se de forma diferente.","hideMenu":"Ocultar menu (F8)"},"de":{"specialCars":"Spezialautos","specialTitle":"SPEZIALFAHRZEUGE","specialDescription":"Boss-, Charakter-, Sponsor- und Intro-Fahrzeuge, getrennt von normalen Autos.","specialAll":"Alle","specialBoss":"Bosse","specialCharacter":"Charaktere","specialSponsor":"Sponsoren","specialIntro":"Intro","specialOther":"Andere","specialSelect":"Spezialfahrzeug wählen","specialDestination":"Garagenplatz","specialAdd":"Auto hinzufügen / ersetzen","specialAddTuned":"Mit maximalem Tuning hinzufügen","specialCount":"Spezialvarianten: {count}","specialPreview":"{category} · {name}","specialNone":"Keine Fahrzeuge in dieser Kategorie.","specialNote":"Vor dem Ersetzen ein Backup erstellen. Manche Varianten können sich im Spiel anders verhalten.","hideMenu":"Menü ausblenden (F8)"},"ru":{"specialCars":"Особые авто","specialTitle":"ОСОБЫЕ АВТОМОБИЛИ","specialDescription":"Машины боссов, персонажей, спонсоров и вступления.","specialAll":"Все","specialBoss":"Боссы","specialCharacter":"Персонажи","specialSponsor":"Спонсоры","specialIntro":"Интро","specialOther":"Другие","specialSelect":"Выберите особую машину","specialDestination":"Место в гараже","specialAdd":"Добавить / заменить","specialAddTuned":"Добавить с максимальным тюнингом","specialCount":"Особых вариантов: {count}","specialPreview":"{category} · {name}","specialNone":"В этой категории нет машин.","specialNote":"Сделайте резервную копию перед заменой автомобиля. Некоторые варианты могут отличаться в игре.","hideMenu":"Скрыть меню (F8)"},"vi":{"specialCars":"Xe đặc biệt","specialTitle":"XE ĐẶC BIỆT","specialDescription":"Xe trùm, nhân vật, nhà tài trợ và biến thể mở đầu.","specialAll":"Tất cả","specialBoss":"Trùm","specialCharacter":"Nhân vật","specialSponsor":"Tài trợ","specialIntro":"Mở đầu","specialOther":"Khác","specialSelect":"Chọn xe đặc biệt","specialDestination":"Vị trí gara","specialAdd":"Thêm / thay xe","specialAddTuned":"Thêm xe với nâng cấp tối đa","specialCount":"Biến thể đặc biệt: {count}","specialPreview":"{category} · {name}","specialNone":"Không có xe trong mục này.","specialNote":"Hãy sao lưu trước khi thay xe. Một số biến thể có thể hoạt động khác trong game.","hideMenu":"Ẩn menu (F8)"},"zh":{"specialCars":"特殊车辆","specialTitle":"特殊车辆","specialDescription":"首领、角色、赞助商以及开场车辆的特殊版本。","specialAll":"全部","specialBoss":"首领","specialCharacter":"角色","specialSponsor":"赞助商","specialIntro":"开场","specialOther":"其他","specialSelect":"选择特殊车辆","specialDestination":"车库位置","specialAdd":"添加 / 替换车辆","specialAddTuned":"添加并升级至最高性能","specialCount":"特殊车型：{count}","specialPreview":"{category} · {name}","specialNone":"此类别没有车辆。","specialNote":"替换车辆前请先完整备份。某些特殊车型的游戏表现可能有所不同。","hideMenu":"隐藏菜单 (F8)"},"ja":{"specialCars":"スペシャルカー","specialTitle":"スペシャルカー","specialDescription":"ボス、キャラクター、スポンサー、イントロに登場する特別仕様車。","specialAll":"すべて","specialBoss":"ボス","specialCharacter":"キャラクター","specialSponsor":"スポンサー","specialIntro":"イントロ","specialOther":"その他","specialSelect":"スペシャルカーを選択","specialDestination":"ガレージのスロット","specialAdd":"追加 / 置き換え","specialAddTuned":"最大チューンで追加","specialCount":"特殊車種：{count}","specialPreview":"{category} · {name}","specialNone":"該当する車はありません。","specialNote":"車を置き換える前にバックアップしてください。一部の特別仕様車はゲーム内で異なる動作をする場合があります。","hideMenu":"メニューを隠す (F8)"},"tr":{"specialCars":"Özel Araçlar","specialTitle":"ÖZEL ARAÇLAR","specialDescription":"Boss araçları, karakter araçları, sponsor kaplamaları ve nadir giriş varyantları. Normal koleksiyondan ayrıdır ve aynı güvenli kayıt düzenleyicisini kullanır.","specialAll":"Tümü","specialBoss":"Bosslar","specialCharacter":"Karakterler","specialSponsor":"Sponsorlar","specialIntro":"Giriş","specialOther":"Diğer","specialSelect":"Özel araç seç","specialDestination":"Garaj hedefi","specialAdd":"Özel Araç Ekle / Değiştir","specialAddTuned":"Maksimum performans + parçalarla ekle","specialCount":"Özel varyantlar: {count}","specialPreview":"{category} · {name}","specialNone":"Bu kategoride özel araç yok.","specialNote":"Özel varyantlar beş garaj yuvandan birine eklenir. Önce tam yedek al; bazı nadir ve bölgesel modeller oyunda farklı davranabilir.","hideMenu":"Menüyü Gizle (F8)"}};

  /* Mobile gesture label, localized alongside the rest of the rx menu. */
  const TOUCH_HINTS={
    en: "Mobile: hold 2 fingers for 1.3s to completely hide/show RX.",
    tr: "Mobil: RX menüsünü tamamen gizlemek/göstermek için iki parmağını 1,3 saniye basılı tut.",
    fr: "Mobile : maintiens 2 doigts pendant 1,3 s pour masquer/réafficher complètement RX.",
    es: "Móvil: mantén 2 dedos durante 1,3 s para ocultar/mostrar por completo RX.",
    pt: "Celular: mantenha 2 dedos pressionados por 1,3 s para ocultar/mostrar todo o RX.",
    de: "Mobil: 2 Finger 1,3 s lang halten, um RX vollständig aus-/einzublenden.",
    ru: "Мобильный: удерживайте 2 пальца 1,3 с, чтобы полностью скрыть/показать RX.",
    vi: "Di động: giữ 2 ngón tay trong 1,3 giây để ẩn/hiện toàn bộ RX.",
    zh: "手机：双指长按 1.3 秒，即可完全隐藏/显示 RX。",
    ja: "モバイル：2本指を1.3秒長押しするとRX全体を非表示・再表示できます。",
  };
  for(const [code,label] of Object.entries(TOUCH_HINTS))
    if(SPECIAL_TEXT[code])SPECIAL_TEXT[code].touchHint=label;

  function browserLanguage() {
    const candidates = navigator.languages?.length ? navigator.languages : [navigator.language || 'en'];
    for (const candidate of candidates) { const code = String(candidate).toLowerCase().split('-')[0]; if (Object.hasOwn(STRINGS,code)) return code; }
    return 'en';
  }
  let preference = 'en';
  try { const v = localStorage.getItem(LOCALE_KEY); if (v === 'auto' || Object.hasOwn(STRINGS,v)) preference = v; } catch (_) {}
  let lang = preference === 'auto' ? browserLanguage() : preference;
  function tr(key, values={}) {
    const template = SPECIAL_TEXT[lang]?.[key] ?? SPECIAL_TEXT.en[key] ?? MORE[lang]?.[key] ?? MORE.en[key] ?? STRINGS[lang]?.[key] ?? STRINGS.en[key] ?? key;
    return String(template).replace(/\{(\w+)\}/g, (_, k) => String(values[k] ?? ''));
  }
  const t = new Uint32Array(256);
  for (let i=0;i<256;i++) { let r=i<<24; for(let j=0;j<8;j++) r=(r&0x80000000)?((r<<1)^0x04C11DB7):(r<<1); t[i]=r>>>0; }
  function checksum(data) {
    if(data.length<4) return 0;
    let r = ~((data[0]<<24)|(data[1]<<16)|(data[2]<<8)|data[3])>>>0;
    for(let i=4;i<data.length;i++) r=(((r<<8)|data[i])^t[r>>>24])>>>0;
    return ~r>>>0;
  }
  const dv = bytes => new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
  const get32=(bytes,off)=>dv(bytes).getUint32(off,true);
  const set32=(bytes,off,value)=>dv(bytes).setUint32(off,value,true);
  function isProfile(d) { return d.length===PROFILE_SIZE && d[0]===0x32 && d[1]===0x30 && d[2]===0x43 && d[3]===0x4d && get32(d,4)===PROFILE_SIZE && get32(d,8)===8 && get32(d,12)===54930 && get32(d,28)===0x10d && get32(d,32)===54930; }
  function isSealed(d) { return get32(d,16)===checksum(d.subarray(28,36)) && get32(d,20)===checksum(d.subarray(36)) && get32(d,24)===checksum(d.subarray(0,24)); }
  function seal(d) { set32(d,16,checksum(d.subarray(28,36)));set32(d,20,checksum(d.subarray(36)));set32(d,24,checksum(d.subarray(0,24)));return d; }
  function readName(d) { const b=d.subarray(0xd225,0xd245); const i=b.indexOf(0); return new TextDecoder('windows-1252').decode(i===-1?b:b.subarray(0,i)); }
  const money=d=>dv(d).getInt32(MONEY_OFFSET,true);
  const slotBase=i=>SLOT_OFFSET+i*SLOT_SIZE;
  const carBase=i=>CAR_BASE+i*SLOT_SIZE;
  const slotUsed=(d,i)=>dv(d).getUint16(slotBase(i),true)!==0;
  const slotLocked=(d,i)=>d[slotBase(i)+LOCK_OFFSET]!==0;
  const slotBought=(d,i)=>d[carBase(i)+0x429]!==0;
  const carHash=(d,i)=>get32(d,carBase(i)+0x14);
  function perfMax(d,i){ const at=slotBase(i)+PERF_OFFSET; for(let j=0;j<PERF_LEN;j++)d[at+j]=(j<=56||j===59||j===62)?1:0; }
  function perfStock(d,i){ d.fill(0,slotBase(i)+PERF_OFFSET,slotBase(i)+PERF_OFFSET+PERF_LEN); }
  function writeMoney(d,n){ if(!Number.isInteger(n)||n<0||n>MONEY_MAX)throw Error(tr('invalidAmount'));dv(d).setInt32(MONEY_OFFSET,n,true); }
  const isBusy=()=>['starting','playing','waiting'].includes(document.body?.dataset.phase);
  function assertIdle(){ if(!document.querySelector('#stage'))throw Error(tr('pageMissing'));if(isBusy())throw Error(tr('errorBusy')); }
  async function root(){ if(!navigator.storage?.getDirectory)throw Error(tr('noStorage')); return navigator.storage.getDirectory(); }
  async function profileHandle(name){ const r=await root(); const s=await r.getDirectoryHandle('save');const p=await s.getDirectoryHandle('NFS Underground 2');const f=await p.getDirectoryHandle(name);for await(const [n,h] of f.entries())if(h.kind==='file'&&n.toLowerCase()===name.toLowerCase())return h;throw Error(tr('fileMissing')); }
  async function readProfile(name){ const h=await profileHandle(name);const b=new Uint8Array(await (await h.getFile()).arrayBuffer());if(!isProfile(b)||readName(b).toLowerCase()!==name.toLowerCase()||!isSealed(b))throw Error(tr('badFormat'));return {handle:h,bytes:b}; }
  async function listProfiles(){let dir;try{dir=await (await (await root()).getDirectoryHandle('save')).getDirectoryHandle('NFS Underground 2');}catch{return [];}const out=[];for await(const [n,h] of dir.entries()){if(h.kind!=='directory'||/ DVD | MAGAZINE /i.test(n))continue;try{const {bytes}=await readProfile(n);out.push({name:n,bytes});}catch{}}return out.sort((a,b)=>a.name.localeCompare(b.name)); }
  async function backupFolder(name){ const r=await root();const parent=await r.getDirectoryHandle(atob('aG16LW5mc3UyLWJhY2t1cHM='),{create:true});return parent.getDirectoryHandle(name,{create:true}); }
  async function saveFile(dir,name,bytes){ const h=await dir.getFileHandle(name,{create:true});const w=await h.createWritable();try{await w.write(bytes);await w.close();}catch(e){try{await w.abort();}catch{}throw e;} }
  async function storeBackup(name,bytes){ const folder=await backupFolder(name);await saveFile(folder,'last-before-edit.dat',bytes);await saveFile(folder,`snapshot-${Date.now()}.dat`,bytes);const past=[];for await(const [n,h] of folder.entries())if(h.kind==='file'&&/^snapshot-\d+\.dat$/.test(n))past.push(n);past.sort().reverse();for(const n of past.slice(12))try{await folder.removeEntry(n);}catch{} }
  async function listBackups(name){if(!name)return[];const folder=await backupFolder(name);const a=[];for await(const [n,h] of folder.entries())if(h.kind==='file'&&/^snapshot-\d+\.dat$/.test(n))a.push(n);return a.sort().reverse(); }
  async function getBackup(name,file='last-before-edit.dat'){ const h=await (await backupFolder(name)).getFileHandle(file);const b=new Uint8Array(await (await h.getFile()).arrayBuffer());if(!isProfile(b)||!isSealed(b)||readName(b).toLowerCase()!==name.toLowerCase())throw Error(tr('invalidBackup'));return b; }
  async function writeProfile(h,b){const w=await h.createWritable();try{await w.write(b);await w.close();}catch(e){try{await w.abort();}catch{}throw e;}const got=new Uint8Array(await (await h.getFile()).arrayBuffer());if(!isProfile(got)||!isSealed(got)||got.length!==b.length||got.some((v,i)=>v!==b[i]))throw Error(tr('writeFailed')); }
  async function mutate(fn){ assertIdle();if(!current)throw Error(tr('selectProfile'));const {handle,bytes}=await readProfile(current);const d=bytes.slice();fn(d);seal(d);if(!isSealed(d))throw Error(tr('badGeneratedChecksum'));if(bytes.every((x,i)=>d[i]===x)){notify(tr('noChange'));return;}assertIdle();await storeBackup(current,bytes);await writeProfile(handle,d);notify(tr('modified'));await refresh(); }
  const UNLOCK_RANGES={body:[[0x462,0x475],[0x47e,0x485],[0x59a,0x5fd],[0x61e,0x64d],[0x696,0x6b1],[0x6b6,0x6bd],[0x6c2,0x6c9]],special:[[0x486,0x495],[0x49a,0x49d],[0x4a2,0x4ad],[0x4b6,0x4bd],[0x5fe,0x61d],[0x7da,0x7e1]],graphics:[[0x4ce,0x53d]],performance:[[0x586,0x58d]]};
  function unlockParts(d,slot,cat){if(!slotUsed(d,slot))throw Error(tr('selectedSlotEmpty'));const cats=cat==='all'?Object.keys(UNLOCK_RANGES):[cat];for(const c of cats)for(const [a,b] of UNLOCK_RANGES[c])for(let i=a;i<=b;i++)d[carBase(slot)+i]=0xff;}
  const CAR_PRESETS = {"Nissan Skyline R34":["27EA8843010000000400000001000000000000005E3748BE78EA231917017369F83D7AB30000000000000000F29F09D30969A8C685E2700B303E668C8EEB0CD398438535F1216F3522B8D0593A31E0C28E365BA741488F6F26C44736A2BCAC677518B35DB1C96BC964C753F775776AB9A82D28E70000000000000000AB04673835BC879B51A3014951A30149613A784A613A784A00000000B304C43A688EA35349A9219A0547C9FA0547C9FAAD096445","0000000000000000CC586C21BDF0545DFE887D7BE0F83B2DD3D86C30103969D123F866C179201B938CF3305209E69E743C4452CBE4BDBCB80000000000000000","20E8F9030000000000000000B6FFA597"],"Toyota Supra":["D79B6643010000000400000001000000000000008AC4B80324939792C3662A84249EC5A400000000000000009E19BC463518AAB085E2700B5C8171043A65BF46C4F2861F1DD1701F4EE2FACAE6C517EDBA9BB80BED52995F52EE71A7CE210ACC2123BD4DDD5F833410235EC521F8915FD4C33F520000000000000000570F7128611CD38C7D034D3A7D034D3A8D9AC33B8D9AC33B00000000DF640F2C688EA35375096D8B0547C9FA0547C9FAAD096445","000000000000000078B476EF693826152A8B2EFD0C802E287F45B089BC803A894F356173A55899AC3831769BB53E2A2468B2486C3DDBAF9E0000000000000000","20E8F9030000000000000000628D7F74"],"Mazda RX-7":["6E4E98430100000004000000010000000000000000DC00005AC4C635797EACAA1A97E886000000000000000054DB9473AB109B7885E2700BD263448DF02698733AEB77E793C961E744D00B531CCD27B330DFBCDB2305263048DC822F44650E9C57D5491ED3E3C5F0C625F10957D5F82ECA47820E00000000000000008DC1FDF85715F66E73FC6F1C73FC6F1C8393E61D8393E61D00000000D55D320E688EA3536B02906D0547C9FA0547C9FAAD096445AD096445974E44FA974E44FA0547C9FA0547C9FA0547C9FA","00000000000000002EB709341F91130620A5D87882A47D93B5F8E35E72D9277AC5A4F9819B7D0BC3EEF42C80EBC7A0115E629008AA9ACDED0000000000000000","20E8F903000000000000000018F9A478"],"Nissan 350Z":["AA529E4301000000040000000100000000000000D1C60A00CB191962AA0577C82B7CF622000000000000000085C10726FCBC6A7985E2700B234FF902210D0B268B9747E8E47531E8D5D477C68D03EDCD014C3CDA140C93FED9E0EEA215D28D9A48DCB6EC64E971FC77DD1D8BC8EC81E95B4D2E1A00000000000000007EC86AC768FA030B84E17DB884E17DB89478F4B99478F4B900000000E64240AA688EA3537CE79D090547C9FA0547C9FAAD096445","0000000000000000DF6E36B5D0691172B1AB35D9D3D2152D26F1812B23B225E69693B26DAC64BB801FBED9F35CA1A423EF690F5B9343EE980000000000000000","20E8F9030000000000000000493ED1E8"],"Nissan 350Z (Rachel)":["AA529E4301000000040000000100000000000000D1C60A00CB191962AA0577C82B7CF622000000000000000085C107263E0E157E85E2700B234FF902594A7E118B9747E8E47531E86F85F045F8C8A44C8C9DD45DC1491C57A1E106536EFA54FAC10F63457D30F6B1B0072BF1C1349D5B7494B2CF00000000000000007EC86AC768FA030B968657C684E17DB821115F0221115F0200000000E64240AA688EA3537CE79D090547C9FA0547C9FAAD096445","0000000000000000DF6E36B5D0691172B1AB35D9D3D2152D26F1812B23B225E69693B26D2D50D756C019738D3D690389F02D476C6EF96E3C40F4B36400000000","20E8F9030000000000000000493ED1E8"],"Pontiac GTO (Caleb)":["8982974301000000040000000100000000000000C9AC0000C37A0513298086A3CC356F2500000000000000007DFC2641F45671F889E2700B1B71E136232C315483314E67E562935A6F85F045D1949AF647F12A3A7BB7498D9AAB74650DA8C00E407144E75C591B156F4CF5B8C03D41EA53BDD7320000000000000000765DF8C1602E4457978657C67C15BE04EC9B97DCEC9B97DC00000000DE7680F6688EA353741BDE550547C9FA0547C9FAAD096445AD096445974E44FA974E44FA0547C9FA0547C9FA0547C9FA","0000000000000000D7DD0DE3C85004D8A9936B58CB5C41731EBA1E371B99184CC69EFC80A48814F81761575654E2161CE7C9C96154F96E3C959807B700000000","20E8F90300000000000000004101C15E"],"Mitsubishi Lancer Evo VIII":["5C1B9A4301000000040000000100000000000000F6EFD20910C2B1C2AF42563590ACAFD800000000000000008AC9F08FA1C5742085E2700BC8824B992615F48F30A0518F897E3B8FBA9A2658D2203856261FB492D94305C6BEA69D343AA505530D1429B449C46652FC14AE9F0D7F240B4028237000000000000000004300DD8ECD2ABDC0E911376EE911376EF9A8AD6FF9A8AD6F","000000000000000064A6C6C955568F57969BB50E78859E1D6BF8202DA89EA3CBBB10EE0211BFCA522465D407A11DE520D46E5F00E5BDBCB80000000000000000","20E8F90300000000000000004E112914"],"Subaru Impreza":["08D5A64301000000040000000100000000000000F85844CF521C178971687BFD122206F600000000000000004C4DF59FA3C1093185E2700BCA9C6D1BE898F89F329CE69F8B7AD09F3C9FEAE1149D6C79284C8B9D1B11C22B40AB61BE3CD2DC5D4FE1E519CB2A2079BE4B949D4F1D2A71C28EDC96000000000000000085CD99F44FA013DE6B878D8B6B878D8B7B1E048D7B1E048D00000000CDE84F7D688EA353638DADDC0547C9FA0547C9FAAD096445","00000000000000002A6BA8831B8134C19C855DE3FE35182DB1B9D02B6EC94835419438A1173CC4ADEA82FDC1E7C4CC09DAFE3B06EBBDBCB80000000000000000","20E8F903000000000000000010F38EE9"],"Ford Mustang GT":["40CB8E43010000000400000001000000000000001958163513B8FA59F201EC77730F196E0000000000000000CDF588DA447A12BE85E2700B6B447C0A69418CDAD354EF2C2C33D92C1D0404D4D5698CA7496D917B5C568CCA21107BB05DF3E23B9026B0B8ACE0BC71BFBDC7A9101B274AA344798F0000000000000000C6126493B08D2656CC74A003CC74A003DC0B1705DC0B1705000000002ED662F5688EA353C47AC0540547C9FA0547C9FAAD096445","00000000000000002D6DA4041ED687D43FC64839E1F1E45CF4F13455711E9C48A489F61E3A16D5926DA129492A907A0C7D32A35EE5BDBCB80000000000000000","20E8F903000000000000000097693789"],"Mazda RX-8":["C7448D430100000004000000010000000000000001DC0000FBEC1B38DAACD3765BFDC2370000000000000000B53888A42C1AFAC785E2700B537C568D51848BA4BBF4D63614D3C036053E53F6BD0668EE31C1966E44273C1E094ACAD24547E82E78F75F0C9482FBB8A79CDAD8F81FA5A18BE6B7D60000000000000000AEE313E7987BD01FB4624ACDB4624ACDC4F9C0CEC4F9C0CE0000000016C40CBF688EA353AC686A1E0547C9FA0547C9FAAD096445","00000000000000000F2EF3020059726BE1749D450390996956547DF853A186DFC6683193DC4544014FC57E858C34A8B21F6385CAE6BDBCB80000000000000000","20E8F90300000000000000007985A578"]};
  const hexBytes = str => Uint8Array.from(str.match(/.{2}/g).map(v=>parseInt(v,16)));
   let donors = Object.entries(CAR_PRESETS).map(([name,blocks])=>({name,blocks:blocks.map(hexBytes),hash:parseInt(blocks[0].slice(40,48).match(/../g).reverse().join(''),16)>>>0}));
  // Additional 39 community-documented vehicles and variants; see NOTICE.md.
  // Asset format: [ASCII name length][name][3 x uint16 LE block length + bytes], simple LZ literals/copies.
  // Asset bytes are bundled locally; no fetch or remote hosting is used.
  const rx_EXTRA_CAR_DONORS_PACKED = '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';
  function rxLoadExtraCars() {
    const packed=Uint8Array.from(atob(rx_EXTRA_CAR_DONORS_PACKED),c=>c.charCodeAt(0));
    const expanded=[];
    for(let i=0;i<packed.length;) {
      const op=packed[i++];
      if(op<128) {
        const n=op+1;
        if(i+n>packed.length)throw Error('rx car catalogue: invalid literal run.');
        for(let t=0;t<n;t++)expanded.push(packed[i++]);
      } else {
        const n=(op&127)+3;
        if(i+1>=packed.length)throw Error('rx car catalogue: invalid match.');
        const distance=packed[i]|(packed[i+1]<<8);i+=2;
        if(distance<1||distance>expanded.length)throw Error('rx car catalogue: invalid match distance.');
        for(let t=0;t<n;t++)expanded.push(expanded[expanded.length-distance]);
      }
    }
    if(expanded.length!==11656)throw Error('rx car catalogue: invalid decompressed length.');
    const data=Uint8Array.from(expanded),newCars=[];
    for(let i=0;i<data.length;) {
      const nameLen=data[i++];
      if(!nameLen||i+nameLen>data.length)throw Error('rx car catalogue: invalid vehicle name.');
      const name=String.fromCharCode(...data.subarray(i,i+nameLen));i+=nameLen;
      const blocks=[];
      for(let j=0;j<3;j++) {
        if(i+2>data.length)throw Error('rx car catalogue: short block header.');
        const size=data[i]|(data[i+1]<<8);i+=2;
        if(size<16||size>500||i+size>data.length)throw Error('rx car catalogue: invalid vehicle block.');
        blocks.push(data.slice(i,i+size));i+=size;
      }
      const hash=new DataView(blocks[0].buffer).getUint32(20,true);
      newCars.push({name,blocks,hash});
    }
    if(newCars.length!==39)throw Error('rx car catalogue: expected 39 additional vehicles.');
    return newCars;
  }
  let rxExtraCars=[];
  try{rxExtraCars=rxLoadExtraCars();}
  catch(err){console.error('[rx] Extra vehicle catalogue unavailable:',err);}
  donors=[...donors,...rxExtraCars];
   let donorByHash=new Map(donors.map(x=>[x.hash,x.name]));
   function parseDonorLibrary(raw){
     if (!raw || typeof raw!=='object' || Array.isArray(raw)) throw Error('Invalid car database.');
     const found=[];
     for (const [name,values] of Object.entries(raw)) {
       if (name.length>110 || !Array.isArray(values) || values.length<3) continue;
       const desired=[0x5870,0x5950,0x5b20].map(off=>values.find(v=>v && v.off===off));
       if(desired.some(v=>!v || typeof v.hex!=='string'))continue;
       const parts=desired.map(v=>v.hex.replace(/\s+/g,''));
       if(parts.some((hex,i)=>hex.length===0||hex.length%2!==0||!/^[0-9a-f]+$/i.test(hex)||hex.length>1100))continue;
       const blocks=parts.map(hexBytes);
       if(blocks.some((a,i)=>[0,0xe0,0x2b0][i]+a.length>SLOT_SIZE)||blocks[0].length<24)continue;
       const hash=new DataView(blocks[0].buffer).getUint32(20,true);
       found.push({name,blocks,hash});
     }
     if(found.length<10 || found.length>150)throw Error('This JSON does not look like a compatible NFSU2 donor catalogue.');
     return found;
   }

  function injectCar(d,slot,donor){ const base=carBase(slot),original=d.slice();const find=pred=>{for(let i=0;i<5;i++)if(i!==slot&&pred(i))return i;return -1;};const needHeader=!slotUsed(d,slot),needLink=!d.subarray(base+0x294,base+0x2a4).some(Boolean);const header=needHeader?find(i=>slotUsed(original,i)):-1;if(needHeader&&header<0)throw Error('You need at least one existing garage vehicle to insert into an empty slot.');const link=needLink?find(i=>original.subarray(carBase(i)+0x294,carBase(i)+0x2a4).some(Boolean)):-1;const offs=[0,0xe0,0x2b0];donor.blocks.forEach((b,i)=>{if(offs[i]+b.length>SLOT_SIZE)throw Error('Donor block does not fit slot.');d.set(b,base+offs[i]);});perfStock(d,slot);d[base+0x428]=0;d[base+0x429]=1;if(header>=0)d.set(original.subarray(carBase(header)+0x27c,carBase(header)+0x27c+24),base+0x27c);if(link>=0)d.set(original.subarray(carBase(link)+0x294,carBase(link)+0x2a4),base+0x294);d[0xa175]=Math.max(d[0xa175],Math.min(slot+1,6));}
   const UNIQUE_NAMES=['Weight reduction','Transmission','Nitrous','Engine','Turbo','Suspension','Brakes','ECU & fuel','Tires'];
   const DYNO_NAMES=['Circuit','Drag','Drift','Street X','URL'];
   const STAGE_FLAGS={nitrous:[12,13,14],turbo:[26,27,28],tires:[53,54,55]};
   function requireUsed(d,i){if(!Number.isInteger(i)||i<0||i>=5||!slotUsed(d,i))throw Error(tr('selectedSlotEmpty'));}
   function setStage(d,i,group,level){
     requireUsed(d,i);
     const flags=STAGE_FLAGS[group];
     if(!flags||!Number.isInteger(level)||level<0||level>3)throw Error('Invalid upgrade tier.');
     for(const index of flags)d[slotBase(i)+PERF_OFFSET+index]=0;
     if(level)d[slotBase(i)+PERF_OFFSET+flags[level-1]]=1;
   }
   function setUnique(d,i,category,on){
     requireUsed(d,i);
     if(!Number.isInteger(category)||category<0||category>=9)throw Error('Invalid unique category.');
     set32(d,slotBase(i)+0x2e8+category*4,on?1:0);
   }
   function setDynoCurve(d,i,race,which,preset){
     requireUsed(d,i);
     if(!Number.isInteger(race)||race<0||race>4||!['ecu','turbo','both'].includes(which)||!['neutral','low','high','flat'].includes(preset))throw Error('Invalid dyno setup.');
     const base=slotBase(i)+0x354+41*race;
     const values=Array.from({length:9},(_,k)=>preset==='neutral'?100:preset==='low'?(k<3?135:k>5?95:115):preset==='high'?(k>5?135:k<3?95:115):120);
     if(which==='ecu'||which==='both')d.set(values,base+0x17);
     if(which==='turbo'||which==='both')d.set(values,base+0x20);
   }
  // NFSU2 career save customization and shop flags. Source: Starladdey/nfsu2-save-editor (MIT).
  // 25 car-lot model keys, 24 bytes apart; only fill empty indices to preserve existing custom vehicles.
  const CAR_LOT_KEYS = [
    [0x0bc,'CB933443'],[0x0d4,'BC5C3043'],[0x0ec,'709F1843'],[0x104,'156E1143'],[0x11c,'382A2E43'],
    [0x134,'34824F43'],[0x14c,'6AA94D43'],[0x164,'CD0F7243'],[0x17c,'150E6A43'],[0x194,'D79B6643'],
    [0x1ac,'C92B5143'],[0x1c4,'6FFC8943'],[0x1dc,'9A2A5E43'],[0x1f4,'3CC15F43'],[0x20c,'A0C78443'],
    [0x224,'78654343'],[0x23c,'AA529E43'],[0x254,'6BEB8D43'],[0x26c,'F23B9643'],[0x284,'89829743'],
    [0x29c,'40CB8E43'],[0x2b4,'27EA8843'],[0x2cc,'5C1B9A43'],[0x2e4,'6E4E9843'],[0x2fc,'08D5A643'],
  ];
  const SHOPS_START=0xad9a, SHOPS_COUNT=0x3a;
  const SHOP_TIER_A=0xc45b, SHOP_TIER_B=0xc483;
  function revealedShopCount(d){let n=0;for(let i=0;i<SHOPS_COUNT;i++)if(d[SHOPS_START+i]===1)n++;return n;}
  function lotUnlockedCount(d){return CAR_LOT_KEYS.filter(([off])=>d[off]!==0).length;}
  function shopTier(d){const n=[...Array.from({length:5},(_,i)=>d[SHOP_TIER_A+i*8]),...Array.from({length:5},(_,i)=>d[SHOP_TIER_B+i*8])];return Math.min(3,Math.max(0,...n));}
  function revealShops(d){d.fill(1,SHOPS_START,SHOPS_START+SHOPS_COUNT);}
  function unlockCarLot(d){
    for(const [off,hex] of CAR_LOT_KEYS){
      // Leave already occupied slots (including existing modded keys) untouched.
      if(d[off]!==0)continue;
      const b=hexBytes(hex);d.set(b,off);
    }
  }
  function unlockGlobalShopTiers(d,tier=3){
    const value=Math.max(1,Math.min(3,Math.trunc(tier)));
    for(const start of [SHOP_TIER_A,SHOP_TIER_B])
      for(let off=start;off<=start+0x20;off+=8)d[off]=Math.max(d[off],value);
  }
  function allOwnedParts(d,cats){
    for(let i=0;i<SLOT_COUNT;i++)if(slotUsed(d,i))for(const cat of cats)unlockParts(d,i,cat);
  }
  function unlockVisuals(d){revealShops(d);unlockGlobalShopTiers(d);allOwnedParts(d,['body','special','graphics']);}
  function safeCareerUnlocks(d){
    revealShops(d);unlockCarLot(d);unlockGlobalShopTiers(d);
    allOwnedParts(d,['body','special','graphics','performance']);
    // Intentionally does not touch career completion, races, sponsor progression, or player money.
  }
  const LOOK_BLOCKS=[{rel:0,length:0xe0},{rel:0xe0,length:0x40},{rel:0x2b0,length:0x10}];
  function copyLook(d,from,to){
    if(from===to)throw Error(tr('lookDistinctError'));
    if(!slotUsed(d,from)||!slotUsed(d,to))throw Error(tr('selectedSlotEmpty'));
    if(carHash(d,from)!==carHash(d,to))throw Error(tr('lookModelError'));
    const src=carBase(from),dst=carBase(to);
    for(const {rel,length} of LOOK_BLOCKS)d.set(d.slice(src+rel,src+rel+length),dst+rel);
  }
   const fmt=n=>Number(n||0).toLocaleString(lang==='en'?'en-US':lang);
  const host=document.createElement('div'); host.id='rx-nfsu2-overlay';
  function style(target,rules){const s=new CSSStyleSheet();s.replaceSync(rules);target.adoptedStyleSheets=[...target.adoptedStyleSheets,s];}
  style(document,`#rx-nfsu2-overlay{position:fixed!important;inset:0!important;width:100vw!important;height:100vh!important;z-index:2147483647!important;pointer-events:none!important;overflow:visible!important}`);
  const shadow=host.attachShadow({mode:'closed'});
  style(shadow,`
  /* RX / Underground 2 Revived -- dark charcoal and lime palette */
  *{box-sizing:border-box; -webkit-tap-highlight-color:transparent}
  /* Remove Chromium / Edge Android's blue square on tapping RX controls.
     This only affects our isolated shadow root, never the game's UI. */
  button,a,select,label,[role="button"]{-webkit-tap-highlight-color:transparent!important}
  button{-webkit-user-select:none;user-select:none}
  button,select,input{font:inherit}
  button{cursor:pointer}
  .hidden{display:none!important}
  .widget{font:13px/1.45 Inter,Segoe UI,Arial,sans-serif;color:#f2f3ee;position:absolute;inset:0;pointer-events:none;--line:#50534e;--green:#c6f77e;--green2:#a9e454;--muted:#b8bdb5}
  .launcher{position:absolute;left:0;top:0;width:80px;height:80px;padding:0;background:transparent;border:0;pointer-events:auto;cursor:grab;touch-action:none;filter:drop-shadow(0 5px 11px #000a) drop-shadow(0 0 7px #b8f76557);transition:filter .2s,transform .2s;user-select:none}
  .launcher:active{cursor:grabbing}
  .launcher:hover{filter:drop-shadow(0 7px 15px #000c) drop-shadow(0 0 12px #c8ff7bbd)}
  .launcher img{display:block;width:100%;height:100%;object-fit:contain;pointer-events:none;user-select:none;-webkit-user-drag:none}
  .icon-fallback{display:none;font-weight:900;color:#162000;background:#b9ef73;border:1px solid #d6ff9b;padding:18px;border-radius:12px}
  .launcher.icon-error img{display:none}.launcher.icon-error .icon-fallback{display:block}
  .panel{position:absolute;width:min(454px,calc(100vw - 16px));max-height:calc(100vh - 18px);overflow:hidden;pointer-events:auto;padding:0;border:1px solid #a6d969;border-radius:17px;background:linear-gradient(150deg,#1b1c1c 0%,#101112 60%,#181a17 100%);box-shadow:0 20px 70px #000e,0 0 28px #a5ec3430, inset 0 1px #ffffff19;opacity:0;visibility:hidden;transform:translateY(9px) scale(.985);transition:opacity .2s,transform .2s,visibility .2s}
  /* Scroll inside the rounded frame so the native scrollbar never forms square corners. */
  .panel-scroll{max-height:calc(100vh - 20px);overflow-x:hidden;overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;padding:17px;scrollbar-width:thin;scrollbar-color:#abe56b transparent}
  .panel-scroll::-webkit-scrollbar{width:9px}
  .panel-scroll::-webkit-scrollbar-track{background:transparent;margin-block:14px;border-radius:99px}
  .panel-scroll::-webkit-scrollbar-thumb{background:linear-gradient(180deg,#d0fb96,#87bd49);border:2px solid #20251b;border-radius:99px;min-height:32px}
  .panel-scroll::-webkit-scrollbar-thumb:hover{background:#dbffa5}
  .panel-scroll::-webkit-scrollbar-corner{background:transparent}
  /* Chromium/Edge: let the fully rounded WebKit thumb render; Firefox keeps its native thin thumb. */
  @supports not (-moz-appearance:none){.panel-scroll{scrollbar-width:auto;scrollbar-color:auto}}
  @supports(height:100dvh){.panel{max-height:calc(100dvh - 18px)}.panel-scroll{max-height:calc(100dvh - 20px)}}
  .panel.open{opacity:1;visibility:visible;transform:translateY(0) scale(1)}
  .head{display:flex;align-items:flex-start;gap:12px;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid #484b46}
  .head-brand{flex:1;min-width:0}
  .brand-logo{display:block;max-width:328px;width:100%;height:auto;max-height:86px;object-fit:contain;object-position:left;filter:drop-shadow(0 2px 4px #0009) drop-shadow(0 0 5px #b3f16b56)}
  .brand-fallback{display:none;color:#d2ff8e;font-size:22px;font-weight:900;font-style:italic;text-shadow:0 0 9px #a7ef5c83}
  .head-brand.logo-error .brand-logo{display:none}.head-brand.logo-error .brand-fallback{display:block}
  .version{margin-top:4px;font-size:10px;letter-spacing:.7px;color:#adb4a6}
  .close{background:linear-gradient(#303130,#1a1c1a);border:1px solid #626760;color:#f5f5f1;border-radius:9px;min-width:34px;height:32px;font-size:18px;box-shadow:inset 0 1px #ffffff14}
  .close:hover{background:#394332;border-color:#b9f276;color:#d8ff9f}
  .status{padding:10px;margin:12px 0;border-radius:9px;border-left:3px solid #baf276;background:linear-gradient(90deg,#283022,#252822);font-size:12px;color:#e6f5df}
  .status.playing{border-left-color:#f1b661;background:#32291d}
  .profile-row{display:grid;grid-template-columns:minmax(0,1fr) 128px;gap:10px}
  .field{min-width:0;margin:8px 0}.field label{display:block;margin:0 0 6px;font-weight:660;color:#ebefe8}.field select,.field input{width:100%}
  input,select{background:#0d0f0e;color:#f6f7f3;border:1px solid #60665c;padding:9px 10px;border-radius:9px;outline:none;min-width:0;max-width:100%;color-scheme:dark}
  input:hover,select:hover{border-color:#8fae6b}
  input:focus,select:focus{border-color:#c6f77e;box-shadow:0 0 0 1px #b6ea6654,0 0 12px #91d34325}
  input[type=number]{font-variant-numeric:tabular-nums}
  .tabs{display:flex;flex-wrap:wrap;gap:6px;margin:14px 0}
  .tab{border:1px solid #565a54;color:#e6e8e2;background:linear-gradient(180deg,#373937,#232523);border-radius:9px;padding:8px 11px;font-size:11px;font-weight:700;box-shadow:inset 0 1px #ffffff16}
  .tab:hover{border-color:#b2e87b;background:linear-gradient(#414a3b,#262d23)}
  .tab.active{background:linear-gradient(180deg,#ddffa0 0%,#b4ee62 48%,#83bf35 100%);color:#162008;border-color:#d4fb91;box-shadow:0 0 13px #b8f37a60,inset 0 1px #ffffff8c;text-shadow:0 1px #fff6}
  .block{background:linear-gradient(155deg,#282a28,#191b19);border:1px solid #60655b;border-radius:12px;padding:12px;margin:10px 0;box-shadow:inset 0 1px #ffffff0d}
  .title{color:#c7f68a;font-size:12px;font-weight:800;letter-spacing:.35px;margin:0 0 9px;text-transform:uppercase}
  .muted{font-size:11px;color:#bec3bb;margin:7px 0}.hint{font-size:10px;color:#aeb5a8;margin:5px 0}
  .numeric{font-weight:900;font-size:24px;color:#d0fa8b;letter-spacing:.4px;margin:5px 0 12px}
  .row{display:flex;gap:6px;align-items:center;flex-wrap:wrap}.row>*{flex:1;min-width:85px}
  .grid2{display:grid;grid-template-columns:1fr 1fr;gap:7px}.grid2>*{min-width:0}
  .btn{background:linear-gradient(180deg,#3a3d39,#252825);color:#f4f7ee;border:1px solid #666d61;border-radius:9px;padding:9px 10px;font-size:11px;font-weight:700;box-shadow:inset 0 1px #ffffff20}
  .btn:hover{border-color:#c6f77e;background:linear-gradient(#444e3c,#252e20)}
  .btn.primary{background:linear-gradient(180deg,#e2ffa4 0%,#b7f06b 55%,#86c535 100%);color:#192109;border-color:#d6ff96;box-shadow:0 0 11px #adf05e45,inset 0 1px #ffffff9a;font-weight:800}
  .btn.primary:hover{background:linear-gradient(#eaffbf,#c4fc84,#93d240);box-shadow:0 0 17px #b6ec78a6}
  .btn.danger{background:linear-gradient(#483030,#2d2020);border-color:#8b5757;color:#f2cccc}.btn.danger:hover{border-color:#ed9999}
  .btn.secondary{background:linear-gradient(#303331,#202221)}
  .btn:disabled{opacity:.45;cursor:not-allowed;box-shadow:none}.wide{width:100%}.space{margin-top:9px}
  .stats{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
  .stat{padding:10px 5px;text-align:center;border:1px solid #4d5548;border-radius:9px;background:linear-gradient(#292d26,#1b1d1a)}
  .stat strong{display:block;font-size:15px;color:#c6f77e}.stat small{font-size:10px;color:#bec5b6}
  .slots{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:6px}
  .slot{text-align:center;background:#292d26;border:1px solid #606a54;border-radius:9px;padding:8px 3px;min-width:0;font-size:10px;overflow-wrap:anywhere}
  .slot strong{display:block;font-size:16px;color:#d0f998}.slot.locked{opacity:.57}.slot small{display:block;font-size:9px;color:#adb5a6}
  .notice{background:#252a21;border-left:2px solid #99c66e;padding:11px;border-radius:9px;color:#d1d9cb;font-size:11px;margin-top:13px}
  .toast{position:absolute;right:12px;bottom:102px;max-width:min(380px,calc(100vw - 24px));padding:12px;background:#292e22;border:1px solid #a4d66f;color:#f5f8f0;box-shadow:0 8px 34px #000b;border-radius:10px;pointer-events:none}
  .toast.bad{border-color:#d78686}
  .special-filters{display:flex;gap:6px;flex-wrap:wrap;margin:10px 0 13px}
  .special-filter{flex:1 0 28%;min-width:0;white-space:nowrap;padding:8px 5px;font-size:10px;font-weight:800;border:1px solid #575e51;border-radius:8px;background:linear-gradient(#343934,#202421);color:#e7ebe1;box-shadow:inset 0 1px #ffffff13}
  .special-filter:hover{border-color:#b6ed75;background:linear-gradient(#495241,#293224)}
  .special-filter.active{background:linear-gradient(#e3ffad,#b7ed6f,#84c437);border-color:#d5f993;color:#1a2a0b;box-shadow:0 0 11px #b6e86b49,inset 0 1px #ffffff75}
  .special-preview{min-height:38px;display:flex;align-items:center;overflow-wrap:anywhere;background:linear-gradient(90deg,#293123,#202420);border:1px solid #667850;border-left:3px solid #b7e96e;border-radius:9px;padding:10px;font-size:11px;color:#d6f4af;margin:8px 0 12px}
  .rx-menu-controls{display:flex;justify-content:flex-end;margin:-3px 0 8px}
  .rx-touch-hint{display:none;color:#afcf95;font-size:10px;text-align:right;margin:-5px 0 12px}
  @media(pointer:coarse){.rx-touch-hint{display:block}}

  .rx-hide-button{padding:6px 10px;font-size:10px;border-radius:7px;background:linear-gradient(#313630,#232622);color:#e9f1e0}
  .badge-beta{font-size:9px;color:#dfdfd7;background:#343831;border:1px solid #666b62;padding:2px 5px;border-radius:5px;margin-left:5px}
  button:focus-visible{outline:2px solid #d7ff9a;outline-offset:2px}
  @media(max-width:430px){.panel-scroll{padding:11px}.brand-logo{max-width:255px}.tab{padding:7px 9px}.profile-row{grid-template-columns:minmax(0,1fr) 109px}.stats{gap:4px}.stat{padding:8px 2px}.slot{padding:7px 2px}}
  @media(prefers-reduced-motion:reduce){.panel,.launcher{transition:none}}
  /* RX minimal interface: flatter surfaces, quieter accents, compact navigation. */
  .widget{--line:#343a40;--green:#a9c7a0;--green2:#8eae85;--muted:#aeb5bc;color:#edf0f2}
  .launcher{width:66px;height:66px;filter:drop-shadow(0 4px 10px #0009);transition:transform .16s,filter .16s}
  .launcher:hover{filter:drop-shadow(0 5px 12px #000b);transform:scale(1.035)}
  .launcher img{display:none!important}
  .icon-fallback{display:flex;align-items:center;justify-content:center;width:54px;height:54px;margin:6px;border-radius:15px;padding:0;background:#171b1e;border:1px solid #66736b;color:#d8e7d7;font-size:22px;letter-spacing:-1px;font-weight:800}
  .panel{width:min(430px,calc(100vw - 16px));border:1px solid #42494e;border-radius:13px;background:#171a1d;box-shadow:0 18px 54px #000c;}
  .panel-scroll{padding:14px;scrollbar-color:#66736b transparent}
  .panel-scroll::-webkit-scrollbar-thumb{background:#66736b;border:2px solid #171a1d}
  .head{align-items:center;padding-bottom:10px;border-color:#343a40}
  .brand-logo{display:none!important}
  .brand-fallback{display:block!important;color:#e1e9e2;font-size:27px;font-style:normal;letter-spacing:-1.5px;text-shadow:none;line-height:1}
  .version{margin-top:3px;color:#929da4;font-size:9px;letter-spacing:1.1px}
  .close{background:#22272b;border:1px solid #41494e;border-radius:8px;box-shadow:none}
  .close:hover{background:#30383d;border-color:#84938a;color:#fff}
  .status{padding:8px 10px;margin:9px 0;border:1px solid #343e37;border-left:2px solid #91ad91;border-radius:8px;background:#202722;color:#dce6dc;font-size:11px}
  .status.playing{border-color:#554331;border-left-color:#c49b65;background:#2b251f}
  .profile-row{grid-template-columns:minmax(0,1fr) 112px;gap:8px}
  .tabs{flex-wrap:nowrap;overflow-x:auto;overscroll-behavior-x:contain;scrollbar-width:none;gap:5px;margin:11px 0;padding-bottom:2px}
  .tabs::-webkit-scrollbar{display:none}
  .tab{flex:0 0 auto;border:1px solid #3d454a;border-radius:7px;padding:7px 9px;background:#242a2e;box-shadow:none;color:#dce1e4;font-size:10px}
  .tab:hover{border-color:#718278;background:#2b3330}
  .tab.active{background:#dce8dc;color:#202a22;border-color:#dce8dc;box-shadow:none;text-shadow:none}
  .block{background:#1e2326;border:1px solid #343c40;border-radius:9px;padding:10px;margin:8px 0;box-shadow:none}
  .title{color:#c5d6c7;font-size:10px;letter-spacing:.65px;margin-bottom:7px}
  .muted{color:#b0b9be}.hint{color:#929da3}
  input,select{background:#15191c;border:1px solid #414a50;border-radius:7px;padding:8px 9px}
  input:hover,select:hover{border-color:#718278}
  input:focus,select:focus{border-color:#a8c1aa;box-shadow:0 0 0 1px #a8c1aa33}
  .btn{background:#2a3034;border:1px solid #485157;border-radius:7px;padding:8px 9px;box-shadow:none}
  .btn:hover{border-color:#829487;background:#343d3a}
  .btn.primary{background:#dce8dc;color:#202a22;border-color:#dce8dc;box-shadow:none}
  .btn.primary:hover{background:#edf4ed;box-shadow:none}
  .btn.secondary{background:#242a2e}
  .stat,.slot{background:#202629;border:1px solid #3a4448;border-radius:7px}
  .stat strong,.slot strong{color:#d0dfd1}
  .notice{background:#222a25;border-left-color:#91ad91;border-radius:7px}
  .special-filter{background:#252c30;border:1px solid #424c50;border-radius:7px;box-shadow:none}
  .special-filter.active{background:#dce8dc;border-color:#dce8dc;color:#202a22;box-shadow:none}
  .special-preview{background:#222a25;border:1px solid #3c4940;border-left:2px solid #91ad91;border-radius:7px;color:#dce6dc}
  .rx-hide-button{background:#242a2e;border:1px solid #424c50;color:#dce1e4;box-shadow:none}
  button:focus-visible{outline:2px solid #b9cfba;outline-offset:2px}
  @media(max-width:430px){.panel-scroll{padding:11px}.profile-row{grid-template-columns:minmax(0,1fr) 104px}.tab{padding:7px 8px}}
  /* Keep every category visible: responsive grid instead of a clipped horizontal tab strip. */
  .tabs{display:grid;grid-template-columns:repeat(auto-fit,minmax(88px,1fr));gap:6px;overflow:visible;overscroll-behavior:initial;padding:0;margin:11px 0}
  .tab{min-width:0;white-space:normal;text-align:center;justify-content:center;padding:8px 4px;line-height:1.25}
    `);
  shadow.innerHTML=`<div class="widget">
   <button class="launcher" id="rx-launcher" aria-label="RX menu (F6)" title="RX menu (F6)"><img id="rx-icon" alt="RX" draggable="false"><span class="icon-fallback">RX</span></button>
   <section class="panel" id="rx-panel" role="dialog" aria-label="RX Mod Menu">
    <div class="head"><div class="head-brand"><img class="brand-logo" id="rx-brand-logo" alt="RX" draggable="false"><span class="brand-fallback">RX</span><div class="version">NFSU2 MOD MENU · V1.0.9</div></div><button class="close" id="rx-close" aria-label="Close menu">×</button></div>
    <div class="status" id="rx-status"></div>
    <div class="rx-menu-controls"><button class="btn secondary rx-hide-button" type="button" id="rx-hide-menu" data-i18n="hideMenu" title="F8">Hide Menu (F8)</button></div>
   <div class="rx-touch-hint" data-i18n="touchHint">Mobile: hold 2 fingers for 1.3s to hide/show RX.</div>
    <div class="profile-row"><div class="field"><label for="rx-profiles" data-i18n="profile">Career profile</label><select id="rx-profiles"></select></div><div class="field"><label for="rx-language" data-i18n="language">Language</label><select id="rx-language"></select></div></div>
    <nav class="tabs" id="rx-tabs"><button class="tab active" data-tab="money">＄ <span data-i18n="money">Money</span></button><button class="tab" data-tab="garage">▣ <span data-i18n="garage">Garage</span></button><button class="tab" data-tab="cars">◆ <span data-i18n="cars">Cars</span></button><button class="tab" data-tab="specialcars">★ <span data-i18n="specialCars">Special Cars</span></button><button class="tab" data-tab="tuning">⚙ <span data-i18n="tuning">Tuning</span></button><button class="tab" data-tab="customize">✦ <span data-i18n="customize">Customize</span></button><button class="tab" data-tab="career">⌁ <span data-i18n="career">Career</span></button><button class="tab" data-tab="security">◇ <span data-i18n="safety">Safety</span></button></nav>
    <div data-page="money"><div class="block"><div class="title" data-i18n="balance">CURRENT BALANCE</div><div class="numeric" id="rx-balance">—</div><label for="rx-money-input" data-i18n="setCash">Set career cash</label><input id="rx-money-input" type="number" min="0" max="2147483647" step="1"><div class="row space"><button class="btn" data-money="50000">50K</button><button class="btn" data-money="1000000">1M</button><button class="btn" data-money="999999999">MAX</button></div><button class="btn primary wide space" id="rx-save-money" data-i18n="applyMoney">Apply Money</button></div>
     <div class="block"><div class="title" data-i18n="moneyTools">CASH SHORTCUTS</div><div class="row"><button class="btn" data-add="10000">+10K</button><button class="btn" data-add="100000">+100K</button><button class="btn" data-add="1000000">+1M</button></div><button class="btn secondary wide space" id="rx-zero" data-i18n="resetCash">Set to $0</button></div>
     <div class="block"><div class="title" data-i18n="stats">PROFILE OVERVIEW</div><div class="stats"><div class="stat"><strong id="rx-count-cars">—</strong><small data-i18n="carsCount">Cars</small></div><div class="stat"><strong id="rx-count-slots">—</strong><small data-i18n="slotCount">Open slots</small></div><div class="stat"><strong id="rx-check">—</strong><small data-i18n="verified">Checksums</small></div></div></div>
    </div>
    <div data-page="garage" class="hidden"><div class="block"><div class="title" data-i18n="yourGarage">YOUR GARAGE</div><div class="slots" id="rx-slots"></div><div class="field"><label for="rx-garage-slot" data-i18n="editSlot">Select garage slot</label><select id="rx-garage-slot"></select></div><div class="row"><button class="btn primary" id="rx-unlock-all" data-i18n="unlockGarage">Unlock 5 Slots</button><button class="btn" id="rx-unlock-one" data-i18n="unlockOne">Unlock Selected Slot</button></div><button class="btn secondary wide space" id="rx-lock-empty" data-i18n="lockEmpty">Lock Empty Slot</button></div>
     <div class="block"><div class="title" data-i18n="cloneTitle">CLONE AN EXISTING CAR</div><p class="muted" data-i18n="duplicateDesc">Copy a car to an empty slot .</p><div class="grid2"><select id="rx-source"></select><select id="rx-dest"></select></div><button class="btn secondary wide space" id="rx-duplicate" data-i18n="copyCar">Duplicate Car</button></div>
     <div class="block"><div class="title" data-i18n="swapTitle">SWAP GARAGE SLOTS</div><div class="grid2"><select id="rx-swap-a"></select><select id="rx-swap-b"></select></div><button class="btn secondary wide space" id="rx-swap" data-i18n="swapCars">Swap Slots</button></div></div>
    <div data-page="cars" class="hidden">
      <div class="block"><div class="title" data-i18n="vehicleUnlocks">VEHICLE UNLOCKS</div>
        <button class="btn primary wide" id="rx-unlock-vehicles" data-i18n="unlockAllVehicles">Unlock All Vehicles</button>
        <p class="hint" data-i18n="vehicleUnlockNote">Unlocks the 25 cars in the Car Lot. All 49 known cars and special variants are already included in the list below.</p>
      </div><div class="block"><div class="title" data-i18n="carInjector">CAR COLLECTION</div><div class="field"><label for="rx-car-search" data-i18n="carSearch">Search car / variant</label><input id="rx-car-search" type="search" placeholder="Skyline, Supra, Rachel…"><p class="hint" id="rx-car-count"></p><label class="space" for="rx-car-model" data-i18n="chooseCar">Choose a vehicle</label><select id="rx-car-model"></select></div><div class="field"><label for="rx-car-slot" data-i18n="targetSlot">Garage destination</label><select id="rx-car-slot"></select></div><button class="btn primary wide" id="rx-inject" data-i18n="addCar">Add / Replace Car</button><button class="btn wide space" id="rx-inject-tuned" data-i18n="carTuned">Add fully tuned car</button><p class="hint"><span data-i18n="carNote">Career car injection. Keep a game backup.</span></p></div><div class="block"><div class="title" data-i18n="carLibrary">EXTENDED VEHICLE LIBRARY</div><button class="btn wide" id="rx-import-donors" data-i18n="importDonors">Import vehicle database (JSON)</button><input type="file" id="rx-donors-file" class="hidden" accept=".json,application/json"><p class="hint" data-i18n="donorsNote">Import compatible car-donors.json to extend the catalogue (optional).</p></div></div>
     
      <div data-page="specialcars" class="hidden">
        <div class="block special-block">
          <div class="title" data-i18n="specialTitle">SPECIAL VEHICLES</div>
          <p class="muted" data-i18n="specialDescription">Bosses, characters, sponsors and intro variants.</p>
          <div class="special-filters" id="rx-special-filters" role="group" aria-label="Special vehicle categories">
            <button class="special-filter active" type="button" data-special-filter="all" data-i18n="specialAll" aria-pressed="true">All</button>
            <button class="special-filter" type="button" data-special-filter="boss" data-i18n="specialBoss" aria-pressed="false">Bosses</button>
            <button class="special-filter" type="button" data-special-filter="character" data-i18n="specialCharacter" aria-pressed="false">Characters</button>
            <button class="special-filter" type="button" data-special-filter="sponsor" data-i18n="specialSponsor" aria-pressed="false">Sponsors</button>
            <button class="special-filter" type="button" data-special-filter="intro" data-i18n="specialIntro" aria-pressed="false">Intro</button>
            <button class="special-filter" type="button" data-special-filter="other" data-i18n="specialOther" aria-pressed="false">Other</button>
          </div>
          <div class="field"><label for="rx-special-model" data-i18n="specialSelect">Choose special vehicle</label>
            <select id="rx-special-model"></select>
            <p class="hint" id="rx-special-count" aria-live="polite"></p>
          </div>
          <div class="special-preview" id="rx-special-preview" aria-live="polite"></div>
          <div class="field"><label for="rx-special-slot" data-i18n="specialDestination">Garage destination</label>
            <select id="rx-special-slot"></select>
          </div>
          <button class="btn primary wide" type="button" id="rx-special-inject" data-i18n="specialAdd">Add / Replace Special Car</button>
          <button class="btn wide space" type="button" id="rx-special-tuned" data-i18n="specialAddTuned">Add with max performance + parts</button>
          <p class="hint space" data-i18n="specialNote">Make a full backup before replacing a car.</p>
        </div>
      </div>
     <div data-page="tuning" class="hidden"><div class="block"><div class="title" data-i18n="perfAll">ALL OWNED VEHICLES</div><div class="grid2"><button class="btn primary" id="rx-max-all" data-i18n="maxAll">Max All</button><button class="btn" id="rx-stock-all" data-i18n="stockAll">Stock All</button></div></div><div class="block"><div class="title" data-i18n="perfOne">SELECTED VEHICLE</div><select id="rx-tune-slot"></select><div class="grid2 space"><button class="btn primary" id="rx-max-one" data-i18n="maxOne">Max Selected</button><button class="btn" id="rx-stock-one" data-i18n="stockOne">Stock Selected</button></div></div>
      <div class="block"><div class="title" data-i18n="unlockTuning">UNLOCK CATEGORIES</div><label class="muted" for="rx-parts-category" data-i18n="category">Part category</label><select id="rx-parts-category"><option value="body" data-i18n="catBody">Body Parts</option><option value="special" data-i18n="catSpecial">Specialties</option><option value="graphics" data-i18n="catGraphics">Graphics</option><option value="performance" data-i18n="catPerf">Performance Shop</option><option value="all" data-i18n="catAll">All categories</option></select><button class="btn secondary wide space" id="rx-parts-unlock" data-i18n="unlockParts">Unlock category</button><button class="btn wide space" id="rx-parts-allcars" data-i18n="unlockAllCars">Unlock category for all garage cars</button><p class="hint" data-i18n="unlockNote"></p></div>
       <div class="block"><div class="title" data-i18n="stageTitle">NITROUS, TURBO & TIRE TIERS</div><div class="grid2"><div class="field"><label data-i18n="stageGroup" for="rx-stage-group">Choose upgrade</label><select id="rx-stage-group"><option value="nitrous" data-i18n="stageNitrous">Nitrous</option><option value="turbo" data-i18n="stageTurbo">Turbo</option><option value="tires" data-i18n="stageTires">Tires</option></select></div><div class="field"><label data-i18n="stageLevel" for="rx-stage-level">Package tier</label><select id="rx-stage-level"><option value="0" data-i18n="stageNone">Stock</option><option value="1" data-i18n="stageStreet">Street</option><option value="2" data-i18n="stagePro">Pro</option><option value="3" data-i18n="stageExtreme">Extreme</option></select></div></div><button class="btn primary wide" id="rx-stage-apply" data-i18n="applyStage">Apply stage to selected car</button></div>
       <div class="block"><div class="title" data-i18n="uniqueTitle">UNIQUE PERFORMANCE UPGRADES</div><div class="field"><label data-i18n="uniqueCategory" for="rx-unique-category">Unique category</label><select id="rx-unique-category"></select></div><div class="grid2"><button class="btn" id="rx-unique-enable" data-i18n="uniqueOn">Enable unique upgrade</button><button class="btn" id="rx-unique-disable" data-i18n="uniqueOff">Disable unique upgrade</button><button class="btn secondary" id="rx-unique-all" data-i18n="uniqueAll">Enable all 9 unique upgrades</button><button class="btn secondary" id="rx-unique-clear" data-i18n="uniqueClear">Disable all 9</button></div><p class="hint" data-i18n="uniqueNote">New upgrade flags. Test in the game.</p></div>
       <div class="block"><div class="title" data-i18n="dynoTitle">DYNO — 5 RACE SETUPS</div><div class="field"><label for="rx-dyno-race" data-i18n="dynoRace">Race setup</label><select id="rx-dyno-race"></select></div><div class="grid2"><div class="field"><label data-i18n="dynoCurve" for="rx-dyno-curve">Tune curves</label><select id="rx-dyno-curve"><option value="both">ECU + Turbo</option><option value="ecu">ECU</option><option value="turbo">Turbo</option></select></div><div class="field"><label data-i18n="dynoPreset" for="rx-dyno-preset">Curve profile</label><select id="rx-dyno-preset"></select></div></div><button class="btn primary wide" id="rx-dyno-apply" data-i18n="dynoApply">Apply dyno preset</button><p class="hint" data-i18n="dynoNote">New: edit ECU/Turbo setup curves. Test in game.</p></div></div>
     <div data-page="customize" class="hidden">
       <div class="block"><div class="title" data-i18n="paintAndVinyls">PAINTS & VINYLS</div>
         <p class="muted" data-i18n="paintAccessInfo">Graphics Shops are available through Career → Live Graphics Shops. Enter a shop in game to change paint, vinyls and decals. Changes save normally.</p></div>

       <div class="block"><div class="title" data-i18n="visualUnlock">FULL VISUAL CUSTOMIZATION</div>
         <div class="grid2"><button class="btn" id="rx-widebody" data-i18n="bodyUnlock">Unlock Body Kits + Widebody</button>
         <button class="btn primary" id="rx-visual-all" data-i18n="allVisualUnlock">Unlock All Visual Upgrades</button></div>
         <p class="hint" data-i18n="featureNote"></p></div>
       <div class="block"><div class="title" data-i18n="appearance">COPY VEHICLE APPEARANCE</div>
         <div class="grid2"><div class="field"><label for="rx-look-source" data-i18n="lookSource">Source car</label><select id="rx-look-source"></select></div>
         <div class="field"><label for="rx-look-target" data-i18n="lookDest">Target car</label><select id="rx-look-target"></select></div></div>
         <button class="btn secondary wide" id="rx-copy-look" data-i18n="copyLook">Copy Look Between Same-Model Cars</button>
         <p class="hint" data-i18n="lookNote"></p></div>
     </div>
     <div data-page="career" class="hidden">
       <div class="block"><div class="title" data-i18n="careerStatus">CAREER & SHOP STATUS</div>
         <div class="stats"><div class="stat"><strong id="rx-map-shops">—</strong><small data-i18n="shopsFound">Map shops discovered</small></div>
         <div class="stat"><strong id="rx-car-lot">—</strong><small data-i18n="carLotCount">Car lot vehicles</small></div>
         <div class="stat"><strong id="rx-shop-tier">—</strong><small data-i18n="shopTier">Shop tier</small></div></div>
         <p class="muted"><span data-i18n="careerCompleted">100% completion flag</span>: <strong id="rx-career-completed">—</strong></p><p class="hint" data-i18n="careerOverview"></p></div>
       <div class="block"><div class="title" data-i18n="shopUnlockTitle">OTHER SHOP UNLOCKS</div>
         <button class="btn secondary wide" id="rx-lot-unlock" data-i18n="lotOnly">Unlock All 25 Car Lot Vehicles</button>
         <button class="btn secondary wide space" id="rx-global-tiers" data-i18n="globalTiers">Unlock Level 3 Shop Tiers</button></div>
       <div class="block" id="rx-live-shop-block"><div class="title" data-i18n="liveShopTitle">LIVE GRAPHICS SHOPS</div>
         <p class="muted" data-i18n="liveShopDesc">Enable before starting or while playing. Graphics Shops appear on the map; career saves are unchanged.</p>
         <button class="btn primary wide" id="rx-live-shop-toggle" type="button">Enable Live Shop Markers</button>
         <p class="hint" id="rx-live-shop-status" aria-live="polite">Live switch is off.</p></div>
       <div class="block"><div class="title" data-i18n="careerSafe">CAREER-PRESERVING UNLOCKS</div>
         <p class="muted" data-i18n="careerKeep"></p><button class="btn primary wide" id="rx-safe-unlock" data-i18n="safeUnlock">Unlock Everything — Keep Races & Story</button>
         <p class="hint" data-i18n="featureNote"></p></div>
     </div>
    <div data-page="security" class="hidden"><div class="block"><div class="title" data-i18n="backupTitle">SAFETY FIRST</div><p class="muted" data-i18n="backupDesc"></p><button class="btn wide" id="rx-export" data-i18n="downloadBackup">Download Profile Backup</button><button class="btn secondary wide space" id="rx-snapshot" data-i18n="makeBackup">Save Snapshot Now</button><button class="btn wide space" id="rx-restore-last" data-i18n="latestBackup">Restore last backup</button></div>
      <div class="block"><div class="title" data-i18n="snapshots">HISTORY / RESTORE</div><select id="rx-history"></select><button class="btn secondary wide space" id="rx-history-restore" data-i18n="restoreSelected">Restore Selected Snapshot</button></div>
      <div class="block"><div class="title" data-i18n="restoreFile">RESTORE LOCAL FILE</div><button class="btn wide" id="rx-import" data-i18n="importFile">Import profile file</button><input class="hidden" id="rx-import-file" type="file" accept=".bin,.dat,.bak,application/octet-stream"><p class="hint" data-i18n="gameBackup">For full protection also use the game ZIP backup.</p></div>
      <div class="block"><div class="title" data-i18n="tools">TOOLS</div><button class="btn secondary wide" id="rx-refresh" data-i18n="refresh">Refresh Profiles</button><button class="btn secondary wide space" id="rx-reset-pos" data-i18n="resetPos">Reset Icon Position</button><p class="hint" data-i18n="moveHint">Drag icon to move, F6 to toggle</p></div></div>
     <div class="notice" data-i18n="warning">⚠️ Exit game with F9 → Quit game before editing. Avoid cloud conflicts and other tabs.</div>
   </section><div id="rx-toast" class="toast hidden" role="status"></div></div>`;
  // Use two layers: the rounded border is non-scrolling; the inner layer
  // scrolls with an inset, rounded thumb. Existing selectors remain unchanged.
  const frame=shadow.querySelector('#rx-panel');
  const scroller=document.createElement('div');
  scroller.className='panel-scroll';
  while(frame.firstChild)scroller.appendChild(frame.firstChild);
  frame.appendChild(scroller);
  const $=q=>shadow.querySelector(q);
  // RX wordmark is CSS-rendered; legacy rx image assets are intentionally omitted.
  $('#rx-icon').addEventListener('error',()=>$('#rx-launcher').classList.add('icon-error'));
  $('#rx-brand-logo').addEventListener('error',()=>$('.head-brand').classList.add('logo-error'));
  let opened=false,current='',currentData=null,toastTimer=null;
  const buttons=[...shadow.querySelectorAll('button')];
  function notify(message,bad=false){const el=$('#rx-toast');el.textContent=message;el.classList.toggle('bad',bad);el.classList.remove('hidden');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.add('hidden'),5400);}
  function lockUI(yes){for(const b of buttons)if(b.id!=='rx-close'&&b.id!=='rx-launcher')b.disabled=yes;}
  async function action(fn){lockUI(true);try{await fn();}catch(e){console.error('[rx NFSU2]',e);notify(e?.message||String(e),true);}finally{lockUI(false);}}
  function options(select,values){const old=select.value;select.replaceChildren();for(const [label,value] of values)select.add(new Option(label,String(value)));if(values.some(x=>String(x[1])===old))select.value=old;}
  function redraw(){const busy=isBusy();$('#rx-status').textContent=busy?tr('statusPlaying'):current?tr('statusReady',{name:current}):tr('statusNo');$('#rx-status').classList.toggle('playing',busy);$('#rx-balance').textContent=currentData?`${fmt(money(currentData))} $`:'—';const carCount=currentData?Array.from({length:5},(_,i)=>slotUsed(currentData,i)).filter(Boolean).length:0,openCount=currentData?Array.from({length:5},(_,i)=>!slotLocked(currentData,i)).filter(Boolean).length:0;$('#rx-count-cars').textContent=currentData?carCount:'—';$('#rx-count-slots').textContent=currentData?`${openCount}/5`:'—';$('#rx-check').textContent=currentData?'✓':'—';$('#rx-map-shops').textContent=currentData?`${revealedShopCount(currentData)}/58`:'—';$('#rx-car-lot').textContent=currentData?`${lotUnlockedCount(currentData)}/25`:'—';$('#rx-shop-tier').textContent=currentData?`${shopTier(currentData)}/3`:'—';$('#rx-career-completed').textContent=currentData?(currentData[0xa17a]===1?tr('yes'):tr('no')):'—';const slots=$('#rx-slots');slots.replaceChildren();for(let i=0;i<5;i++){const item=document.createElement('div');item.className='slot'+(currentData&&slotLocked(currentData,i)?' locked':'');const title=document.createElement('strong');title.textContent=String(i+1);const state=document.createElement('div');state.textContent=currentData?slotLocked(currentData,i)?tr('locked'):slotUsed(currentData,i)?tr('filled'):tr('empty'):'—';const sub=document.createElement('small');if(currentData&&slotUsed(currentData,i))sub.textContent=donorByHash.get(carHash(currentData,i))||'Custom';item.append(title,state,sub);slots.append(item);}const all=Array.from({length:5},(_,i)=>[`${tr('slot')} ${i+1}${currentData&&slotUsed(currentData,i)?' • '+(donorByHash.get(carHash(currentData,i))||tr('filled')):''}`,i]);for(const id of ['rx-garage-slot','rx-car-slot','rx-special-slot','rx-swap-a','rx-swap-b'])options($('#'+id),all);const used=all.filter((_,i)=>currentData&&slotUsed(currentData,i));const empty=all.filter((_,i)=>currentData&&!slotUsed(currentData,i)&&!slotLocked(currentData,i));options($('#rx-source'),used);options($('#rx-dest'),empty);options($('#rx-tune-slot'),used);options($('#rx-look-source'),used);options($('#rx-look-target'),used);}
  async function refresh(){if(isBusy()){redraw();return;}const list=await listProfiles();const sel=$('#rx-profiles');options(sel,list.length?list.map(x=>[x.name,x.name]):[[tr('noProfiles'),'']]);current=list.some(x=>x.name===current)?current:list[0]?.name||'';sel.value=current;currentData=list.find(x=>x.name===current)?.bytes||null;$('#rx-money-input').value=currentData?String(money(currentData)):'';redraw();await refreshHistory();}
  async function refreshHistory(){const arr=await listBackups(current);options($('#rx-history'),arr.length?arr.map(n=>[new Date(Number(n.match(/\d+/)[0])).toLocaleString(),n]):[[tr('noHistory'),'']]);}
  function translateUI(){for(const el of shadow.querySelectorAll('[data-i18n]'))el.textContent=tr(el.dataset.i18n);const choice=$('#rx-language');options(choice,[['Auto (browser)','auto'],...Object.entries(LOCALES).map(([k,v])=>[v,k])]);choice.options[0].text=tr('auto');choice.value=preference;redraw();refreshCarCatalogue();refreshSpecialCatalogue();presetOptions();if(typeof liveStatus==='function')liveStatus();}
  let pos={x:0,y:0};
  function resetPosition(){pos={x:Math.max(0,window.innerWidth-100),y:Math.max(0,window.innerHeight-100)};place();}
  function place(){pos.x=Math.max(5,Math.min(window.innerWidth-85,pos.x));pos.y=Math.max(5,Math.min(window.innerHeight-85,pos.y));const icon=$('#rx-launcher');icon.style.left=pos.x+'px';icon.style.top=pos.y+'px';placePanel();}
  function placePanel(){const panel=$('#rx-panel');const width=Math.min(454,window.innerWidth-16);const height=Math.min(panel.scrollHeight||580,window.innerHeight-18);panel.style.left=Math.round(Math.max(8,Math.min(window.innerWidth-width-8,pos.x+80-width)))+'px';panel.style.top=Math.round(Math.max(8,Math.min(window.innerHeight-height-8,pos.y-height-9)))+'px';}
  try{const saved=JSON.parse(localStorage.getItem(POS_KEY));if(Number.isFinite(saved?.x)&&Number.isFinite(saved?.y))pos=saved;else resetPosition();}catch{resetPosition();}
  let drag=null,suppressClick=false;
  $('#rx-launcher').addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={id:e.pointerId,sx:e.clientX,sy:e.clientY,x:pos.x,y:pos.y,moved:false};$('#rx-launcher').setPointerCapture(e.pointerId);});
  $('#rx-launcher').addEventListener('pointermove',e=>{if(!drag||drag.id!==e.pointerId)return;const dx=e.clientX-drag.sx,dy=e.clientY-drag.sy;if(Math.abs(dx)+Math.abs(dy)>6)drag.moved=true;if(drag.moved){pos.x=drag.x+dx;pos.y=drag.y+dy;place();}});
  $('#rx-launcher').addEventListener('pointerup',e=>{if(!drag||drag.id!==e.pointerId)return;suppressClick=drag.moved;if(drag.moved)try{localStorage.setItem(POS_KEY,JSON.stringify(pos));}catch{}drag=null;});
  $('#rx-launcher').addEventListener('pointercancel',()=>{drag=null;});
  window.addEventListener('resize',place);
  let fullyHidden=false;
  function setFullyHidden(value){fullyHidden=!!value;host.style.display=fullyHidden?'none':'';if(fullyHidden){opened=false;$('#rx-panel').classList.remove('open');$('#rx-launcher').setAttribute('aria-expanded','false');}}
  function toggle(value=!opened){if(fullyHidden){setFullyHidden(false);value=true;}opened=!!value;$('#rx-panel').classList.toggle('open',opened);$('#rx-launcher').setAttribute('aria-expanded',String(opened));if(opened)action(refresh);requestAnimationFrame(placePanel);}
  $('#rx-launcher').addEventListener('click',()=>{if(suppressClick){suppressClick=false;return;}toggle();});$('#rx-close').addEventListener('click',()=>toggle(false));
  $('#rx-hide-menu').addEventListener('click',()=>setFullyHidden(true));

  // Complete mobile hide: BOTH the menu and animated launcher disappear.
  // Hold TWO fingers steady for 1.3 seconds to hide or restore the entire host.
  // The listeners live on window so the same invisible gesture restores RX.
  // Do not preventDefault: game touchscreen controls remain unchanged.
  const rxTouchGesture=(()=>{
    const TWO_HOLD_MS=1300, MOVE_LIMIT=42, TOGGLE_GAP_MS=950;
    let lastToggle=-Infinity;
    const now=()=>performance.now();
    const fire=()=>{
      const t=now();
      if(t-lastToggle<TOGGLE_GAP_MS)return false;
      lastToggle=t;
      setFullyHidden(!fullyHidden);
      return true;
    };
    const watch=()=>{
      const down=new Map();
      let used=false,twoTimer=null,tooMany=false;
      const clearTwo=()=>{if(twoTimer!==null){clearTimeout(twoTimer);twoTimer=null;}};
      const reset=()=>{down.clear();used=false;tooMany=false;clearTwo();};
      const movedTooFar=(x,y,pt)=>Math.hypot(x-pt.x,y-pt.y)>MOVE_LIMIT;
      const begin=(id,x,y)=>{
        if(down.has(id))return;
        if(!down.size)reset();
        down.set(id,{x,y,moved:false});
        // More than two fingers must never trigger a mobile hide.
        if(down.size>2){tooMany=true;clearTwo();return;}
        if(down.size===2&&!tooMany&&!used){
          clearTwo();
          const startedAt=now();
          twoTimer=setTimeout(()=>{
            twoTimer=null;
            if(used||tooMany||down.size!==2||[...down.values()].some(v=>v.moved)||now()-startedAt<TWO_HOLD_MS-50)return;
            if(fire())used=true;
          },TWO_HOLD_MS);
        }
      };
      const move=(id,x,y)=>{
        const pt=down.get(id);
        if(!pt)return;
        if(movedTooFar(x,y,pt)){pt.moved=true;clearTwo();}
      };
      const end=(id,x,y)=>{
        const pt=down.get(id);
        if(!pt)return;
        down.delete(id);
        clearTwo();
        if(!down.size)reset();
      };
      return {begin,move,end,reset};
    };
    const touch=watch();
    const pointers=watch();
    // Touch and pointer handling preserve compatibility with Edge Android.
    window.addEventListener('touchstart',e=>{
      for(const t of e.changedTouches)touch.begin(t.identifier,t.clientX,t.clientY);
    },{capture:true,passive:true});
    window.addEventListener('touchmove',e=>{
      for(const t of e.changedTouches)touch.move(t.identifier,t.clientX,t.clientY);
    },{capture:true,passive:true});
    window.addEventListener('touchend',e=>{
      for(const t of e.changedTouches)touch.end(t.identifier,t.clientX,t.clientY);
    },{capture:true,passive:true});
    window.addEventListener('touchcancel',e=>{
      for(const t of e.changedTouches)touch.end(t.identifier,t.clientX,t.clientY);
    },{capture:true,passive:true});
    window.addEventListener('pointerdown',e=>{
      if(e.pointerType==='touch')pointers.begin(e.pointerId,e.clientX,e.clientY);
    },{capture:true,passive:true});
    window.addEventListener('pointermove',e=>{
      if(e.pointerType==='touch')pointers.move(e.pointerId,e.clientX,e.clientY);
    },{capture:true,passive:true});
    window.addEventListener('pointerup',e=>{
      if(e.pointerType==='touch')pointers.end(e.pointerId,e.clientX,e.clientY);
    },{capture:true,passive:true});
    window.addEventListener('pointercancel',e=>{
      if(e.pointerType==='touch')pointers.end(e.pointerId,e.clientX,e.clientY);
    },{capture:true,passive:true});
    window.addEventListener('blur',()=>{touch.reset();pointers.reset();},true);
    return true;
  })();
  shadow.addEventListener('keydown',e=>e.stopPropagation());document.addEventListener('keydown',e=>{
    if(e.repeat||e.ctrlKey||e.altKey||e.metaKey)return;
    if(e.key==='F8'){e.preventDefault();e.stopImmediatePropagation();setFullyHidden(!fullyHidden);return;}
    if(e.key==='F6'&&!['INPUT','TEXTAREA'].includes(document.activeElement?.tagName)){e.preventDefault();e.stopImmediatePropagation();toggle();}
  },true);
  $('#rx-tabs').addEventListener('click',e=>{const btn=e.target.closest('[data-tab]');if(!btn)return;for(const x of shadow.querySelectorAll('[data-tab]'))x.classList.toggle('active',x===btn);for(const x of shadow.querySelectorAll('[data-page]'))x.classList.toggle('hidden',x.dataset.page!==btn.dataset.tab);requestAnimationFrame(placePanel);});
  $('#rx-language').addEventListener('change',e=>{preference=e.target.value;lang=preference==='auto'?browserLanguage():preference;try{localStorage.setItem(LOCALE_KEY,preference);}catch{}translateUI();if(!current)$('#rx-profiles').options[0]?.value===''&&($('#rx-profiles').options[0].textContent=tr('noProfiles'));});
  $('#rx-profiles').addEventListener('change',e=>{current=e.target.value;action(async()=>{if(current){currentData=(await readProfile(current)).bytes;$('#rx-money-input').value=String(money(currentData));}else currentData=null;redraw();await refreshHistory();});});
  for(const b of shadow.querySelectorAll('[data-money]'))b.addEventListener('click',()=>$('#rx-money-input').value=b.dataset.money);
  for(const b of shadow.querySelectorAll('[data-add]'))b.addEventListener('click',()=>{const n=money(currentData||new Uint8Array(PROFILE_SIZE));$('#rx-money-input').value=String(Math.min(MONEY_MAX,Math.max(0,n+Number(b.dataset.add))));});
  $('#rx-save-money').addEventListener('click',()=>action(async()=>{const value=$('#rx-money-input').value.trim();if(!value)throw Error(tr('invalidAmount'));await mutate(d=>writeMoney(d,Number(value)));}));
  $('#rx-zero').addEventListener('click',()=>action(()=>mutate(d=>writeMoney(d,0))));
  $('#rx-unlock-all').addEventListener('click',()=>action(()=>mutate(d=>{for(let i=0;i<5;i++)d[slotBase(i)+LOCK_OFFSET]=0;})));
  $('#rx-unlock-one').addEventListener('click',()=>action(()=>mutate(d=>{const i=Number($('#rx-garage-slot').value);d[slotBase(i)+LOCK_OFFSET]=0;})));
  $('#rx-lock-empty').addEventListener('click',()=>action(async()=>{const i=Number($('#rx-garage-slot').value);if(!currentData||slotUsed(currentData,i))throw Error(tr('selectedSlotEmpty')+' / slot contains a car');if(!confirm(tr('confirmLock',{slot:i+1})))return;await mutate(d=>{d[slotBase(i)+LOCK_OFFSET]=1;});}));
  $('#rx-duplicate').addEventListener('click',()=>action(async()=>{const a=Number($('#rx-source').value),b=Number($('#rx-dest').value);if(!$('#rx-source').value||!$('#rx-dest').value||a===b)throw Error(tr('noSource'));if(!confirm(tr('confirmDuplicate',{from:a+1,to:b+1})))return;await mutate(d=>{if(!slotUsed(d,a)||slotUsed(d,b)||slotLocked(d,b))throw Error(tr('invalidSlots'));d.copyWithin(slotBase(b),slotBase(a),slotBase(a)+SLOT_SIZE);});}));
  $('#rx-swap').addEventListener('click',()=>action(async()=>{const a=Number($('#rx-swap-a').value),b=Number($('#rx-swap-b').value);if(a===b)throw Error(tr('chooseSlots'));if(!confirm(tr('confirmSwap',{a:a+1,b:b+1})))return;await mutate(d=>{const tmp=d.slice(slotBase(a),slotBase(a)+SLOT_SIZE);d.copyWithin(slotBase(a),slotBase(b),slotBase(b)+SLOT_SIZE);d.set(tmp,slotBase(b));});}));
   function refreshCarCatalogue(){
     const query=$('#rx-car-search').value.trim().toLowerCase();
     const found=donors.map((d,i)=>[d.name,i]).filter(x=>x[0].toLowerCase().includes(query));
     options($('#rx-car-model'),found);
     $('#rx-car-count').textContent=tr('carCount',{count:found.length})+(query?' / '+donors.length:'');
   }
   refreshCarCatalogue();
   $('#rx-car-search').addEventListener('input',refreshCarCatalogue);
   $('#rx-import-donors').addEventListener('click',()=>$('#rx-donors-file').click());
   $('#rx-donors-file').addEventListener('change',e=>action(async()=>{
     const file=e.target.files?.[0];if(!file)return;
     if(file.size>500000)throw Error('Car database is too large.');
     const imported=parseDonorLibrary(JSON.parse(await file.text()));
     const original=donors.filter(x=>!imported.some(z=>z.name===x.name));
     donors=[...imported,...original];donorByHash=new Map(donors.map(x=>[x.hash,x.name]));
     refreshCarCatalogue();redraw();
     notify(`Vehicle database loaded: ${donors.length} models.`);
     e.target.value='';
   }));

   // Special Cars are curated views of the same donor objects as "Cars":
   // no new offsets, separate modified save format or network loader.
   function specialCarKind(name) {
     const n=String(name||'').trim().toLowerCase();
     if(n.includes('(final boss)')||n.includes('(caleb)'))return 'boss';
     if(n.includes('(sponsor)'))return 'sponsor';
     if(n.includes('(intro)'))return 'intro';
     if(/\b(rachel|nigel|marcus|nikki|scott|capone|snopp dogg|snoop dogg|david choe|tom|player)\b/i.test(n))return 'character';
     if(/'[^']+'/i.test(name))return 'other';
     return null;
   }
   let specialFilter='all';
   const specialKinds={boss:'specialBoss',character:'specialCharacter',sponsor:'specialSponsor',intro:'specialIntro',other:'specialOther'};
   function updateSpecialPreview(){
     const model=$('#rx-special-model'),idx=model.value!==''?Number(model.value):-1,donor=donors[idx];
     const kind=donor&&specialCarKind(donor.name);
     $('#rx-special-preview').textContent=donor&&kind
       ?tr('specialPreview',{category:tr(specialKinds[kind]),name:donor.name}) : tr('specialNone');
     $('#rx-special-inject').disabled=!donor||!kind;
     $('#rx-special-tuned').disabled=!donor||!kind;
   }
   function refreshSpecialCatalogue(){
     const all=donors.map((d,i)=>({d,i,kind:specialCarKind(d.name)})).filter(x=>x.kind!==null);
     const selected=all.filter(x=>specialFilter==='all'||x.kind===specialFilter);
     const pairs=selected.map(x=>[x.d.name,x.i]);
     options($('#rx-special-model'),pairs);
     $('#rx-special-count').textContent=tr('specialCount',{count:selected.length})+' / '+all.length;
     for(const btn of shadow.querySelectorAll('[data-special-filter]')){
       const active=btn.dataset.specialFilter===specialFilter;
       btn.classList.toggle('active',active);btn.setAttribute('aria-pressed',String(active));
     }
     updateSpecialPreview();
   }
   $('#rx-special-filters').addEventListener('click',e=>{
     const button=e.target.closest('[data-special-filter]');if(!button)return;
     specialFilter=button.dataset.specialFilter;
     refreshSpecialCatalogue();
   });
   $('#rx-special-model').addEventListener('change',updateSpecialPreview);
   async function addChosenSpecial(tuned){
     const select=$('#rx-special-model'),destination=$('#rx-special-slot');
     if(select.value===''||destination.value==='')throw Error(tr('specialNone'));
     const idx=Number(select.value),target=Number(destination.value),donor=donors[idx];
     if(!donor||!specialCarKind(donor.name)||!Number.isInteger(target)||target<0||target>=5)throw Error(tr('noSource'));
     if(!confirm(tr('confirmInject',{car:donor.name,slot:target+1})))return;
     await mutate(d=>{injectCar(d,target,donor);if(tuned){perfMax(d,target);unlockParts(d,target,'all');}});
   }
   $('#rx-special-inject').addEventListener('click',()=>action(()=>addChosenSpecial(false)));
   $('#rx-special-tuned').addEventListener('click',()=>action(()=>addChosenSpecial(true)));

  $('#rx-inject').addEventListener('click',()=>action(async()=>{const target=Number($('#rx-car-slot').value),donor=donors[Number($('#rx-car-model').value)];if(!donor||target<0||target>4)throw Error(tr('noSource'));if(!confirm(tr('confirmInject',{car:donor.name,slot:target+1})))return;await mutate(d=>injectCar(d,target,donor));}));
   $('#rx-inject-tuned').addEventListener('click',()=>action(async()=>{
     if(!$('#rx-car-model').value)throw Error('No vehicle matches the current search.');
     const target=Number($('#rx-car-slot').value),idx=Number($('#rx-car-model').value),donor=donors[idx];
     if(!donor||target<0||target>4)throw Error(tr('noSource'));
     if(!confirm(tr('confirmInject',{car:donor.name,slot:target+1})))return;
     await mutate(d=>{injectCar(d,target,donor);perfMax(d,target);unlockParts(d,target,'all');});
   }));
   $('#rx-max-all').addEventListener('click' ,()=>action(()=>mutate(d=>{for(let i=0;i<5;i++)if(slotUsed(d,i))perfMax(d,i);})));
  $('#rx-stock-all').addEventListener('click',()=>action(async()=>{if(!confirm(tr('confirmStock',{scope:'all cars'})))return;await mutate(d=>{for(let i=0;i<5;i++)if(slotUsed(d,i))perfStock(d,i);});}));
  $('#rx-max-one').addEventListener('click',()=>action(()=>mutate(d=>{const i=Number($('#rx-tune-slot').value);if(!slotUsed(d,i))throw Error(tr('selectedSlotEmpty'));perfMax(d,i);})));
  $('#rx-stock-one').addEventListener('click',()=>action(async()=>{const i=Number($('#rx-tune-slot').value);if(!currentData||!slotUsed(currentData,i))throw Error(tr('selectedSlotEmpty'));if(!confirm(tr('confirmStock',{scope:'slot '+(i+1)})))return;await mutate(d=>perfStock(d,i));}));
  $('#rx-parts-unlock').addEventListener('click',()=>action(async()=>{const i=Number($('#rx-tune-slot').value),cat=$('#rx-parts-category').value;if(!currentData||!slotUsed(currentData,i))throw Error(tr('selectedSlotEmpty'));if(!confirm(tr('confirmUnlock',{category:cat,slot:i+1})))return;await mutate(d=>unlockParts(d,i,cat));}));
   $('#rx-parts-allcars').addEventListener('click',()=>action(async()=>{
     const category=$('#rx-parts-category').value;
     if(!confirm(`Unlock ${category} for all occupied garage slots?`))return;
     await mutate(d=>{for(let i=0;i<5;i++)if(slotUsed(d,i))unlockParts(d,i,category);});
   }));
   options($('#rx-unique-category'),UNIQUE_NAMES.map((name,i)=>[name,i]));
   options($('#rx-dyno-race'),DYNO_NAMES.map((name,i)=>[name,i]));
   function presetOptions(){options($('#rx-dyno-preset'),[[tr('dynoNeutral'),'neutral'],[tr('dynoLow'),'low'],[tr('dynoHigh'),'high'],[tr('dynoFlat'),'flat']]);}
   presetOptions();
   $('#rx-stage-apply').addEventListener('click',()=>action(async()=>{
     const i=Number($('#rx-tune-slot').value),group=$('#rx-stage-group').value,level=Number($('#rx-stage-level').value);
     if(!$('#rx-tune-slot').value)throw Error(tr('selectedCar'));
     await mutate(d=>setStage(d,i,group,level));
   }));
   for(const [id,on] of [['rx-unique-enable',true],['rx-unique-disable',false]]){
     $('#'+id).addEventListener('click',()=>action(async()=>{
       if(!$('#rx-tune-slot').value)throw Error(tr('selectedCar'));
       const i=Number($('#rx-tune-slot').value),category=Number($('#rx-unique-category').value);
       await mutate(d=>setUnique(d,i,category,on));
     }));
   }
   for(const [id,on] of [['rx-unique-all',true],['rx-unique-clear',false]]){
     $('#'+id).addEventListener('click',()=>action(async()=>{
       if(!$('#rx-tune-slot').value)throw Error(tr('selectedCar'));
       const i=Number($('#rx-tune-slot').value);
       if(!confirm(`${on?'Enable':'Disable'} 9 unique upgrade flags for slot ${i+1}?`))return;
       await mutate(d=>{for(let j=0;j<9;j++)setUnique(d,i,j,on);});
     }));
   }
   $('#rx-dyno-apply').addEventListener('click',()=>action(async()=>{
     if(!$('#rx-tune-slot').value)throw Error(tr('selectedCar'));
     const i=Number($('#rx-tune-slot').value),race=Number($('#rx-dyno-race').value),which=$('#rx-dyno-curve').value,preset=$('#rx-dyno-preset').value;
     await mutate(d=>setDynoCurve(d,i,race,which,preset));
   }));
   $('#rx-widebody').addEventListener('click',()=>action(()=>mutate(d=>allOwnedParts(d,['body','special']))));
   $('#rx-visual-all').addEventListener('click',()=>action(()=>mutate(d=>unlockVisuals(d))));
   // Native cheat flag documented by nfsu2-re (0x838441), and retained in
  // WebAssembly linear memory in Revived (guest address = linear address).
  // This only reveals markers during play; actual shop entry still depends on the game.
   let liveOn = (() => {try {const saved=localStorage.getItem(LIVE_KEY);return saved===null ? true : saved==='1';}catch {return true;}})();
  let liveTimer = null;
  let liveMemory = null;
  let beforeLive = null;
  let liveError = '';
  const livePhase = () => document.body?.dataset.phase || 'unknown';
  function liveRead() {
    const mem = rx_LIVE_SHOPS.memory;
    if (!mem || !mem.buffer || mem.buffer.byteLength <= rx_LIVE_SHOPS.address) return null;
    try { return {mem, byte:new Uint8Array(mem.buffer,rx_LIVE_SHOPS.address,1)[0]}; }
    catch (e) { liveError=String(e); return null; }
  }
  function liveStatus() {
    const status = $('#rx-live-shop-status');
    const toggle = $('#rx-live-shop-toggle');
    toggle.textContent=tr(liveOn ? 'liveShopOff' : 'liveShopOn');
    toggle.setAttribute('aria-pressed',String(liveOn));
    if (!liveOn) {status.textContent=tr('liveShopOffStatus');return;}
    if (liveError) {status.textContent=liveError;return;}
    if (livePhase()!=='playing') {status.textContent=tr('liveShopWaiting');return;}
    const read=liveRead();
    status.textContent=read && read.byte===1 ? tr('liveShopReady') : tr('liveShopMissing');
  }
  function liveApply() {
    if (!liveOn || livePhase() !== 'playing') {liveStatus();return;}
    const found=liveRead();
    if (!found) {liveStatus();return;}
    if (found.mem!==liveMemory) {liveMemory=found.mem;beforeLive=found.byte;}
    if (found.byte!==0 && found.byte!==1) {
      liveError=`Unexpected game flag value (${found.byte}); refusing to write.`;
      liveStatus();return;
    }
    try { new Uint8Array(found.mem.buffer,rx_LIVE_SHOPS.address,1)[0]=1; }
    catch(e) {liveError=String(e);}
    liveStatus();
  }
  function liveDisable() {
    liveOn=false;
    try{localStorage.setItem(LIVE_KEY,'0');}catch{}
    if (liveTimer!==null) {clearInterval(liveTimer);liveTimer=null;}
    if (liveMemory && beforeLive===0) {
      try {if(liveMemory.buffer.byteLength>rx_LIVE_SHOPS.address)
        new Uint8Array(liveMemory.buffer,rx_LIVE_SHOPS.address,1)[0]=0;}catch{}
    }
    liveMemory=null;beforeLive=null;liveError='';liveStatus();
  }
  $('#rx-live-shop-toggle').addEventListener('click',()=>{
    if (liveOn) {liveDisable();notify(tr('liveShopOffStatus'));return;}
    liveOn=true;try{localStorage.setItem(LIVE_KEY,'1');}catch{}
    liveError='';liveApply();
    liveTimer=setInterval(liveApply,1600);
    notify(tr(livePhase()==='playing' ? 'liveShopReady' : 'liveShopWaiting'));
  });
   $('#rx-unlock-vehicles').addEventListener('click',()=>action(async()=>{
     if(!confirm(tr('confirmAllVehicles')))return;
     await mutate(d=>unlockCarLot(d));
   }));
   $('#rx-lot-unlock').addEventListener('click',()=>action(()=>mutate(d=>unlockCarLot(d))));
   $('#rx-global-tiers').addEventListener('click',()=>action(()=>mutate(d=>unlockGlobalShopTiers(d))));
   $('#rx-safe-unlock').addEventListener('click',()=>action(async()=>{
     if(!confirm(tr('careerKeep')+'\n\n'+tr('featureNote')))return;
     await mutate(d=>safeCareerUnlocks(d));
   }));
   $('#rx-copy-look').addEventListener('click',()=>action(async()=>{
     const from=Number($('#rx-look-source').value),to=Number($('#rx-look-target').value);
     if(!$('#rx-look-source').value||!$('#rx-look-target').value)throw Error(tr('selectedCar'));
     if(!confirm(tr('lookNote')))return;
     await mutate(d=>copyLook(d,from,to));
   }));
   function downloadFile(b,filename){const u=URL.createObjectURL(new Blob([b],{type:'application/octet-stream'}));const a=document.createElement('a');a.href=u;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),15000);}
  $('#rx-export').addEventListener('click',()=>action(async()=>{assertIdle();if(!current)throw Error(tr('selectProfile'));const {bytes}=await readProfile(current);downloadFile(bytes,`RX_NFSU2_${current}_backup.bin`);notify(tr('newBackup'));}));
  $('#rx-snapshot').addEventListener('click',()=>action(async()=>{assertIdle();if(!current)throw Error(tr('selectProfile'));await storeBackup(current,(await readProfile(current)).bytes);await refreshHistory();notify(tr('snapshotSaved'));}));
  async function restoreBytes(bytes){assertIdle();if(!current)throw Error(tr('selectProfile'));if(!isProfile(bytes)||!isSealed(bytes)||readName(bytes).toLowerCase()!==current.toLowerCase())throw Error(tr('invalidBackup'));const {handle,bytes:before}=await readProfile(current);assertIdle();await storeBackup(current,before);await writeProfile(handle,bytes);await refresh();notify(tr('restored'));}
  $('#rx-restore-last').addEventListener('click',()=>action(async()=>{if(!current)throw Error(tr('selectProfile'));const b=await getBackup(current);if(!confirm(tr('confirmRestore',{name:current})))return;await restoreBytes(b);}));
  $('#rx-history-restore').addEventListener('click',()=>action(async()=>{if(!current||!$('#rx-history').value)throw Error(tr('noHistory'));const b=await getBackup(current,$('#rx-history').value);if(!confirm(tr('confirmHistory',{name:current})))return;await restoreBytes(b);}));
  $('#rx-import').addEventListener('click',()=>$('#rx-import-file').click());
  $('#rx-import-file').addEventListener('change',e=>action(async()=>{const f=e.target.files?.[0];if(!f)return;if(f.size!==PROFILE_SIZE)throw Error(tr('fileTooBig'));const b=new Uint8Array(await f.arrayBuffer());if(!isProfile(b)||!isSealed(b)||readName(b).toLowerCase()!==current.toLowerCase())throw Error(tr('invalidBackup'));if(!confirm(tr('confirmImport',{name:current})))return;await restoreBytes(b);e.target.value='';}));
  $('#rx-refresh').addEventListener('click',()=>action(refresh));
  $('#rx-reset-pos').addEventListener('click',()=>{resetPosition();try{localStorage.removeItem(POS_KEY);}catch{}notify(tr('resetPos'));});
  function moveHost(){const parent=document.fullscreenElement||document.body;if(parent&&host.parentElement!==parent)parent.appendChild(host);requestAnimationFrame(place);}
  document.addEventListener('fullscreenchange',moveHost);moveHost();translateUI();
  new MutationObserver(()=>{if(liveOn)liveApply();else liveStatus();if(opened){redraw();placePanel();}}).observe(document.body,{attributes:true,attributeFilter:['data-phase']});
   if(liveOn){ liveApply();liveTimer=setInterval(liveApply,1600); }
   else liveStatus();
}
