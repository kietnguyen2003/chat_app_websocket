package messeage

type MesseageRepository interface {
	Create(messeage Messeage) (*Messeage, error)
}
