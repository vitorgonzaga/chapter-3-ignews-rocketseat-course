import { query as q } from "faunadb";
import { fauna } from "src/services/fauna";
import { stripe } from "src/services/stripe";

export async function saveSubscription(
  subscriptionId: string,
  customerId: string,
  createAction = false
) {
  // Buscar o usuario no FaunaDB com o Id {customerId}
  // Salvar os dados do subscription no FaunaDB
  console.log("customerId", customerId);
  console.log("subscriptionId", subscriptionId);

  const userRef = await fauna.query(
    q.Select(
      "ref",
      q.Get(q.Match(q.Index("user_by_stripe_customer_id"), customerId))
    )
  );

  // obter os dados da subscription no stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // cria um objeto selecionando quais dados serão salvos no faundaDB
  const subscriptionData = {
    id: subscription.id,
    userId: userRef,
    status: subscription.status,
    price_id: subscription.items.data[0].price.id
  }


  // salvando os dados
  if(createAction){
    await fauna.query(
      q.Create(
        q.Collection('subscriptions'),
        { data: subscriptionData }
      )
    )
  } else {
    await fauna.query(
      q.Replace(
        q.Select(
          "ref",
          q.Get(
            q.Match(
              q.Index('subscription_by_id'),
              subscriptionId,
            )
          )
        ),
        { data: subscriptionData }
      )
    )
  }


}
