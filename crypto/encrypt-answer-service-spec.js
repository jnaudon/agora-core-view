describe("EncryptAnswerService tests", function() {
  var group = {
    "g":"27257469383433468307851821232336029008797963446516266868278476598991619799718416119050669032044861635977216445034054414149795443466616532657735624478207460577590891079795564114912418442396707864995938563067755479563850474870766067031326511471051504594777928264027177308453446787478587442663554203039337902473879502917292403539820877956251471612701203572143972352943753791062696757791667318486190154610777475721752749567975013100844032853600120195534259802017090281900264646220781224136443700521419393245058421718455034330177739612895494553069450438317893406027741045575821283411891535713793639123109933196544017309147",
    "p":"49585549017473769285737299189965659293354088286913371933804180900778253856217662802521113040825270214021114944067918826365443480688403488878664971371922806487664111406970012663245195033428706668950006712214428830267861043863002671272535727084730103068500694744742135062909134544770371782327891513041774499809308517270708450370367766144873413397605830861330660620343634294061022593630276805276836395304145517051831281606133359766619313659042006635890778628844508225693978825158392000638704210656475473454575867531351247745913531003971176340768343624926105786111680264179067961026247115541456982560249992525766217307447",
    "q":"24792774508736884642868649594982829646677044143456685966902090450389126928108831401260556520412635107010557472033959413182721740344201744439332485685961403243832055703485006331622597516714353334475003356107214415133930521931501335636267863542365051534250347372371067531454567272385185891163945756520887249904654258635354225185183883072436706698802915430665330310171817147030511296815138402638418197652072758525915640803066679883309656829521003317945389314422254112846989412579196000319352105328237736727287933765675623872956765501985588170384171812463052893055840132089533980513123557770728491280124996262883108653723"
  };

  var EncryptAnswerService;
  var ElGamal;
  var BigInt;

  beforeEach(module("avCrypto"));

  beforeEach(inject(function (_EncryptAnswerService_, _ElGamalService_, _BigIntService_) {
    EncryptAnswerService = _EncryptAnswerService_;
    ElGamal = _ElGamalService_;
    BigInt = _BigIntService_;
  }));

  it("should encrypt and prove plaintext knowledge", inject(function() {
    // random plaintext in arbitrary range
    var plaintext = Math.floor(Math.random() * 10000) + 1;
    console.log(plaintext);

    var params = new ElGamal.Params(
      BigInt.fromInt(group.p),
      BigInt.fromInt(group.q),
      BigInt.fromInt(group.g));
    // generate private and public keys
    var secret = params.generate();
    // encrypt
    var encryptor = EncryptAnswerService.init(secret.pk.toJSONObject());
    var encrypted = encryptor.encryptAnswer(plaintext);

    // verify plaintext proof
    expect(encryptor.verifyPlaintextProof(encrypted)).toBe(true);

    // verify decryption works
    var ctext = new ElGamal.Ciphertext(
      BigInt.fromInt(encrypted.alpha),
      BigInt.fromInt(encrypted.beta),
      secret.pk);
    var decrypted = secret.decryptAndProve(
      ctext,
      ElGamal.fiatshamir_dlog_challenge_generator);
    var plaintextDecrypted = decrypted.plaintext.getPlaintext().intValue();

    expect(plaintextDecrypted).toBe(plaintext);
    console.log(plaintextDecrypted);
  }));
});